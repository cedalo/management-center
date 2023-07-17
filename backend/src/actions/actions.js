const os = require('os');
const http = require('http');
const express = require('express');
const { hostname, hostIPs } = require('../utils/localhost');

const NodeMosquittoClient = require('../client/NodeMosquittoClient');
const { AuthError } = require('../plugins/Errors');
const { stripConnectionsCredentials } = require('../utils/utils');

const HTTP_PORT = 80;
const CEDALO_MC_PROXY_PORT = process.env.CEDALO_MC_PROXY_PORT || 8088;
const CEDALO_MC_PROXY_HOST = process.env.CEDALO_MC_PROXY_HOST || 'localhost';
const CEDALO_MC_PLUGIN_HTTPS_REDIRECT_HTTP_TO_HOST = process.env.CEDALO_MC_PLUGIN_HTTPS_REDIRECT_HTTP_TO_HOST;

const metainfo = (operation, crud) => ({ plugin: 'management-center', operation, crud });

const connectToBroker = (context, brokerName, client) => {
	const brokerConnection = context.brokerManager.getBrokerConnection(brokerName);
	if (brokerConnection && brokerConnection.name === brokerName) {
		const { broker, system, topicTreeManager } = brokerConnection;
		context.brokerManager.connectClient(client, broker, brokerConnection);
		if (broker.connected) {
			context.sendSystemStatusUpdate(system, broker, brokerConnection);
			context.sendTopicTreeUpdate(topicTreeManager.topicTree, broker, brokerConnection);
		} else {
			throw new Error('Broker not connected');
		}
	} else {
		throw new Error('Broker not found/not connected');
	}
};

const disconnectFromBroker = (context, brokerName, client) => {
	context.brokerManager.disconnectClient(client); //!!
};

const unloadPluginAction = {
	type: 'plugin/unload',
	isModifying: true,
	metainfo: metainfo('unloadPlugin', 'delete'),
	fn: ({ user, security, pluginManager }, { pluginId }) => {
		if (!security.acl.isConnectionAuthorized(user, security.acl.atLeastAdmin)) {
			throw AuthError.notAllowed();
		}
		const response = pluginManager.unloadPlugin(pluginId);
		return response;
	}
};

const loadPluginAction = {
	type: 'plugin/load',
	isModifying: true,
	metainfo: metainfo('loadPlugin', 'create'),
	fn: ({ user, security, pluginManager }, { pluginId }) => {
		if (!security.acl.isConnectionAuthorized(user, security.acl.atLeastAdmin)) {
			throw AuthError.notAllowed();
		}
		const response = pluginManager.loadPlugin(pluginId);
		return response;
	}
};
const setPluginStatusAtNextStartupAction = {
	type: 'plugin/setStatusNextStartup',
	isModifying: true,
	metainfo: metainfo('setStatusNextStartup', 'update'),
	fn: ({ user, security, pluginManager }, { pluginId, nextStatus }) => {
		if (!security.acl.isConnectionAuthorized(user, security.acl.atLeastAdmin)) {
			throw AuthError.notAllowed();
		}
		const response = pluginManager.setPluginStatusAtNextStartup(pluginId, !!nextStatus);
		return response;
	}
};

const testConnectionAction = {
	type: 'connection/test',
	metainfo: metainfo('testConnection', 'create'),
	fn: async ({ user, security, configManager }, { connection }) => {
		if (!security.acl.noRestrictedRoles(user)) {
			throw AuthError.notAllowed();
		}
		const testClient = new NodeMosquittoClient({
			brokerName: connection.name,
			brokerId: connection.id
			/* logger: console */
		});

		const filteredConnection = configManager.filterConnectionObject(connection);
		filteredConnection.reconnectPeriod = 0; // add reconnectPeriod to MQTTjsClient so that it does not try to constantly reconnect on unsuccessful connection

		// try {
		await testClient.connect({
			mqttEndpointURL: filteredConnection.url,
			options: NodeMosquittoClient.createOptions(filteredConnection)
		});
		const isNormalDisconnect = true; // used to indicate proper disconnection in order not to trigger reconnect
		await testClient.disconnect(isNormalDisconnect);
		// } catch(error) {
		// 	console.error(error);

		// 	connection.status = {
		// 		connected: false,
		// 		timestamp: Date.now(),
		// 		error: error
		// 	};
		// 	configManager.updateConnection(connection.id, connection);
		// 	sendConnectionsUpdate(testClient);

		// 	throw error;
		// }

		return {
			connected: true
		};
	}
};
const createConnectionAction = {
	type: 'connection/create',
	isModifying: true,
	metainfo: metainfo('createConnection', 'create'),
	fn: async ({ user, security, configManager, licenseContainer }, { connection }) => {
		if (!security.acl.isConnectionAuthorized(user, security.acl.atLeastAdmin, null, null, 'createConnection')) { // passing security.acl.atLeastAdmin is not needed here, we can just pass null instead
			throw AuthError.notAllowed();
		}

		try {
			if (configManager.connections.length < licenseContainer.license.maxBrokerConnections) {
				const existingConnection = configManager.getConnection(connection.id);
				if (existingConnection) {
					throw new Error(`Connection ${connection.id} already exists`);		
				}
				configManager.createConnection(connection);
			} else {
				throw new Error('Maximum number of connections reached.');
			}
		} catch (error) {
			// TODO: handle error because Management Center crashes
			console.error(error);
			throw error;
		}
		return configManager.connections;
	},
	filter: (data) => {
		const {
			connection: { caFile, certFile, keyFile, credentials, ...rest },
			...filteredData
		} = data;
		return {
			...filteredData,
			connection: {
				...rest,
				caFile: !!caFile,
				certFile: !!certFile,
				keyFile: !!keyFile,
				credentials: credentials && Object.keys(credentials).length >0
			}
		};
	}
};
const modifyConnectionAction = {
	type: 'connection/modify',
	isModifying: true,
	metainfo: metainfo('modifyConnection', 'update'),
	fn: async ({ user, security, configManager }, { oldConnectionId, connection }) => {
		if (!security.acl.isConnectionAuthorized(user, security.acl.atLeastAdmin, null, oldConnectionId)) {
			throw AuthError.notAllowed();
		}
		configManager.updateConnection(oldConnectionId, connection);

		return configManager.connections;
	},
	filter: (data) => {
		const {
			connection: { caFile, certFile, keyFile, credentials, ...rest },
			...filteredData
		} = data;
		return {
			...filteredData,
			connection: {
				...rest,
				caFile: !!caFile,
				certFile: !!certFile,
				keyFile: !!keyFile,
				credentials: credentials && Object.keys(credentials).length >0
			}
		};
	}
};
const deleteConnectionAction = {
	type: 'connection/delete',
	isModifying: true,
	metainfo: metainfo('deleteConnection', 'delete'),
	fn: ({ user, security, configManager }, { connectionId }) => {
		try {
			if (!security.acl.isConnectionAuthorized(user, security.acl.atLeastAdmin, null, connectionId)) {
				throw AuthError.notAllowed();
			}
			const connection = configManager.getConnection(connectionId);
			if (connection.cluster) {
				throw new Error(
					`Could not delete "${connectionId}" because it's part of the cluster "${connection.cluster}". Delete cluster first`
				);
			}
			configManager.deleteConnection(connectionId);
			return configManager.connections;
		} catch (error) {
			console.log('error when deleting:', error);
			throw error;
		}
	}
};

const getBrokerConnectionsAction = {
	type: 'connection/list',
	isModifying: false,
	metainfo: metainfo('getBrokerConnections', 'read'),
	fn: (context) => {
		const { user, security, configManager } = context;
		const connections = configManager.connections;
		const filteredConnections = security.acl.filterAllowedConnections(connections, user.connections);
		const result = stripConnectionsCredentials(filteredConnections, user, context);
		return result;
	}
};

const connectToBrokerAction = {
	type: 'connection/connect',
	isModifying: false,
	metainfo: metainfo('connectToBroker', 'update'),
	fn: async (context, { brokerName }) => {
		const { user, security, client } = context;
		if (!security.acl.isConnectionAuthorized(user, null, brokerName)) {
			throw AuthError.notAllowed();
		}
		const response = await connectToBroker(context, brokerName, client);
		return response;
	}
};

const disconnectFromBrokerAction = {
	type: 'connection/disconnect',
	isModifying: false,
	metainfo: metainfo('disconnectFromBroker', 'update'),
	fn: async (context, { brokerName }) => {
		const { client } = context;
		// no need to check if user is authorised because they are probably already connected to broker if they call this action
		const response = await disconnectFromBroker(context, brokerName, client);
		return response;
	}
};

const userCanAccessAPI = ({ user, security }, api, connection) => {
	if (
		api === 'stream-processing' &&
		!security.acl.isConnectionAuthorized(user, security.acl.atLeastAdmin, connection.name)
	) {
		return false;
	}
	if (
		api === 'dynamic-security' &&
		!security.acl.isConnectionAuthorized(user, security.acl.atLeastEditor, connection.name)
	) {
		return false;
	}
	return true;
};

const commandAction = {
	type: 'connection/command',
	isModifying: true,
	metainfo: metainfo('command'),
	fn: async (context, { api, command }) => {
		const { brokerManager, client, user } = context;
		const broker = brokerManager.getBroker(client);
		const connection = brokerManager.getBrokerConnectionByClient(client);
		if (!userCanAccessAPI(context, api, connection)) {
			throw AuthError.notAllowed();
		}
		if (broker) {
			const result = await broker.sendCommandMessage(api, command);
			// console.log(JSON.stringify(result));
			const response = {
				// TODO: remove users and groups properties when Mosquitto supports that API
				// data: result.data || result.users || result.groups,
				data: result.data,
				done: result.error ? false : true,
				error: result.error
			};
			return response;
		} else {
			throw new Error('Client not connected to any broker');
		}
	},
	filter: (data) => {
		const { api, command } = data;
		if (api === 'dynamic-security') {
			switch (command.command) {
				case 'createClient':
				case 'modifyClient':
					const { password: _, ...filtered } = command;
					return filtered;
			}
		}
		return { api, command };
	}
};

const getConfigurationAction = {
	type: 'config/get',
	isModifying: false,
	metainfo: metainfo('getConfiguration', 'read'),
	fn: async ({ user, security, config }) => {
		let configToReturn;
		if (security.acl.isConnectionAuthorized(user, security.acl.atLeastAdmin)) {
			configToReturn = JSON.parse(JSON.stringify(config));
		} else {
			const configCopy = JSON.parse(JSON.stringify(config));
			configCopy.connections = configCopy.connections.map((connection) => {
				delete connection.credentials;
				return connection;
			});
			configToReturn = configCopy;
		}

		configToReturn.connections = security.acl.filterAllowedConnections(
			configToReturn.connections,
			user.connections
		);

		return configToReturn;
	}
};

const getSettingsAction = {
	type: 'settings/get',
	isModifying: false,
	metainfo: metainfo('getSettings', 'read'),
	fn: async ({ user, settingsManager, security }) => {
		if (!security.acl.noRestrictedRoles(user)) {
			throw AuthError.notAllowed();
		}
		return settingsManager.settings;
	}
};

const updateSettingsAction = {
	type: 'settings/update',
	isModifying: true,
	metainfo: metainfo('updateSettings', 'update'),
	fn: async ({ globalSystem, usageTracker, user, settingsManager, security }, { settings }) => {
		if (!security.acl.isConnectionAuthorized(user, security.acl.atLeastAdmin)) {
			throw AuthError.notAllowed();
		}

		settingsManager.updateSettings({
			...settingsManager.settings,
			...settings
		});
		if (settingsManager.settings.allowTrackingUsageData) {
			const data = Object.values(globalSystem);
			usageTracker.send({
				data,
				os: {
					arch: os.arch(),
					cpus: os.cpus(),
					platform: os.platform(),
					release: os.release(),
					version: os.version()
				}
			});
		}
		return settingsManager.settings;
	}
};

const getPluginsAction = {
	type: 'plugin/list',
	isModifying: false,
	metainfo: metainfo('getPlugins'),
	fn: (context) => {
		return context.pluginManager.plugins
				.filter((plugin) => !plugin.options.hidden)
				.map((plugin) => {
					const removeProp = 'context';
					const { [removeProp]: removedPropFromOptions, ...restOptions } = plugin.options;
					return {
						...plugin.meta,
						...restOptions,
						status: plugin.status
					};
				});
	}
};

const startupAction = {
	type: 'startup',
	isModifying: false,
	metainfo: metainfo('startup'),
	fn: (context) => {
		let server;
		const host = CEDALO_MC_PROXY_HOST;
		const port = CEDALO_MC_PROXY_PORT;
		let protocol = context.config.plugins?.find((plugin) => plugin.name === 'https') ? 'https' : 'http';
		
		let httpPlainApp;
		let httpPlainServer;
		
		console.log(`Starting Mosquitto proxy server at ${protocol}://${host}:${port}`);

		if (context.server instanceof Error) {
			// https plugin tried to be loaded but failed
			console.error('HTTPS not properly configured. Exiting...');
			throw new Error('Exit');
		} else if (!context.server) {
			// https plugin not enabled, switch to http server
			server = http.createServer(context.app);
			// context.server = server;
			protocol = 'http';
		} else {
			// https plugin was successfully enabled
			server = context.server;
	
			// if https is not setup on the default HTTP port (which doesn't make sense but we don't restrict this), we open an http listener on default HTTP port
			if (parseInt(port) !== parseInt(HTTP_PORT)) {
				// set up plain http server
				httpPlainApp = express();
				// set up a route to redirect http to https
				httpPlainApp.get('*', function(request, response) {
					response.redirect('https://' + CEDALO_MC_PLUGIN_HTTPS_REDIRECT_HTTP_TO_HOST || request.headers.host + `:${port}` + request.url);
				});
				httpPlainServer =  http.createServer(httpPlainApp);
				// have it listen on 80
				// httpPlainServer.listen(HTTP_PORT)
				httpPlainServer.listen({
					host,
					port: HTTP_PORT
				}, () => {
						console.log(`HTTP to HTTPS redirect set up for http://${host}:${HTTP_PORT}`);
					}
				);
				// context.httpPlainServer = httpPlainServer;
			} else {
				console.log(`HTTP to HTTPS redirect is not set up. Same port used for HTTPS and HTTP (port ${port}). Change port in CEDALO_MC_PROXY_PORT variable to solve this`);
			}
		}

		server.listen(
			{
				host,
				port
			},
			() => {
				console.log(`Started Mosquitto proxy server at ${protocol}://${host}:${server.address().port}`);
				context.controlElements.serverStarted = true;
			}
		);
		server.on('upgrade', (request, socket, head) => {
			context.wss.handleUpgrade(request, socket, head, (socket) => {
				context.wss.emit('connection', socket, request);
			});
		});

		return  { host: hostname, port, protocol, hostIPs, server, httpPlainServer }
	}
};

const shutdownAction = {
	type: 'shutdown',
	isModifying: false,
	metainfo: metainfo('shutdown'),
	fn: async ({ controlElements, stopFunctions }) => {
		controlElements.stopSignalSent = true;
		for (const stopFunction of stopFunctions) {
			await stopFunction();
		}
		controlElements.serverStarted = false;
	}
};




module.exports = {
	unloadPluginAction,
	loadPluginAction,
	setPluginStatusAtNextStartupAction,
	testConnectionAction,
	createConnectionAction,
	modifyConnectionAction,
	getBrokerConnectionsAction,
	commandAction,
	connectToBrokerAction,
	disconnectFromBrokerAction,
	deleteConnectionAction,
	getConfigurationAction,
	getSettingsAction,
	updateSettingsAction,
	startupAction,
	shutdownAction,
	getPluginsAction
};

const os = require('os');
const NodeMosquittoClient = require('../client/NodeMosquittoClient');
const { AuthError } = require('../plugins/Errors');
const { stripConnectionsCredentials } = require('../utils/utils');

const connectToBroker = (context, brokerName, client) => {
	const brokerConnection = context.brokerManager.getBrokerConnection(brokerName);
	if (brokerConnection) {
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
	fn: async ({ user, security, configManager }, { connection }) => {
		if (!security.acl.noRestrictedRoles(user)) {
			throw AuthError.notAllowed();
		}
		const testClient = new NodeMosquittoClient({
			/* logger: console */
		});

		const filteredConnection = configManager.filterConnectionObject(connection);
		filteredConnection.reconnectPeriod = 0; // add reconnectPeriod to MQTTjsClient so that it does not try to constantly reconnect on unsuccessful connection

		// try {
		await testClient.connect({
			mqttEndpointURL: filteredConnection.url,
			options: NodeMosquittoClient.createOptions(filteredConnection)
		});
		await testClient.disconnect();
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
	fn: async ({ user, security, configManager, licenseContainer }, { connection }) => {
		if (!security.acl.isConnectionAuthorized(user, security.acl.atLeastAdmin, null, null, 'createConnection')) { // passing security.acl.atLeastAdmin is not needed here, we can just pass null instead
			throw AuthError.notAllowed();
		}

		try {
			if (configManager.connections.length < licenseContainer.license.maxBrokerConnections) {
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
	updateSettingsAction
};

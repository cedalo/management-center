const fs = require('fs');
const os = require('os');
const path = require('path');
const http = require('http');
const EventEmitter = require('events');
const { v4: uuidv4 } = require('uuid');
const express = require('express');
const session = require('express-session');
const ejs = require('ejs'); //! don't remove this line, it's used for pkg to compile ejs into the executable
const bodyParser = require('body-parser');
const cors = require('cors');
const WebSocket = require('ws');
const swaggerUi = require('swagger-ui-express');

const HTTPClient = require('./src/http/HTTPClient');
const BrokerManager = require('./src/broker/BrokerManager');
const NodeMosquittoClient = require('./src/client/NodeMosquittoClient');
const PluginManager = require('./src/plugins/PluginManager');
const UsageTracker = require('./src/usage/UsageTracker');
const InstallationManager = require('./src/usage/InstallationManager');
const ConfigManager = require('./src/config/ConfigManager');
const SettingsManager = require('./src/settings/SettingsManager');
const { loadInstallation, stripConnectionsCredentials, generateSecret } = require('./src/utils/utils');
const NotAuthorizedError = require('./src/errors/NotAuthorizedError');
const swaggerDocument = require('./swagger.js');
const Logger = require('./src/utils/Logger');
const contentTypeParser = require('./src/middleware/ContentTypeParser');
const actions = require('./src/actions/actions');

console = new Logger(console, false);

const version = require('./src/utils/version');

const preprocessBoolEnvVariable = (envVariable) => {
	return !!((envVariable && typeof envVariable === 'string' && envVariable.toLowerCase() === 'false') ? false : envVariable);
}

const HTTP_PORT = 80;
const CEDALO_MC_PROXY_CONFIG = process.env.CEDALO_MC_PROXY_CONFIG || '../config/config.json';
const CEDALO_MC_PROXY_PORT = process.env.CEDALO_MC_PROXY_PORT || 8088;
const CEDALO_MC_PROXY_HOST = process.env.CEDALO_MC_PROXY_HOST || 'localhost';
const CEDALO_MC_OFFLINE = process.env.CEDALO_MC_MODE === 'offline';
const CEDALO_MC_ENABLE_FULL_LOG = preprocessBoolEnvVariable(process.env.CEDALO_MC_ENABLE_FULL_LOG);
const CEDALO_MC_SHOW_FEEDBACK_FORM = preprocessBoolEnvVariable(process.env.CEDALO_MC_SHOW_FEEDBACK_FORM);
const CEDALO_MC_SHOW_STREAMSHEETS = preprocessBoolEnvVariable(process.env.CEDALO_MC_SHOW_STREAMSHEETS || true);
const CEDALO_MC_USERNAME = process.env.CEDALO_MC_USERNAME;

const CEDALO_MC_PROXY_BASE_PATH = process.env.CEDALO_MC_PROXY_BASE_PATH || '';
const USAGE_TRACKER_INTERVAL = 1000 * 60 * 60;

console.log(`Mosquitto Management Center version ${version.version || 'unknown'}`)
console.log(`MMC is starting in ${process.env.CEDALO_MC_MODE === 'offline' ? 'offline' : 'online'} mode`);

// const LicenseManager = require("../src/LicenseManager");
const LicenseChecker = require('./src/license/LicenseChecker');
const acl = require('./src/security/acl');
const TopicTreeManager = require('./src/topictree/TopicTreeManager');
// const NodeMosquittoProxyClient = require('../frontend/src/client/NodeMosquittoProxyClient');
// const licenseManager = new LicenseManager();
// await licenseManager.loadLicense();
// const license = licenseManager.getLicenseAsJSON();

const checker = new LicenseChecker();
let context = {
	eventEmitter: new EventEmitter(),
	brokerManager: new BrokerManager(),
	requestHandlers: new Map(),
	security: {
		acl: {
			...acl
		}
	}
};


const noCache = (req, res, next) => {
	res.header('Cache-Control', 'private, no-cache, no-store, must-revalidate');
	res.header('Expires', '-1');
	res.header('Pragma', 'no-cache');
	next();
};

const deletePendingRequest = (requestId, requests) => {
	const request = requests.get(requestId);
	if (request) {
		clearTimeout(request.timeoutId);
		requests.delete(requestId);
	}
	return request;
};
const timeoutHandler = (requestId, requests) => {
	const { reject } = deletePendingRequest(requestId, requests);
	reject({
		message: 'Mosquitto Proxy: Timeout',
		requestId
	});
};

const updateSystemTopics = (system, topic, message) => {
	const parts = topic.split('/');
	let current = system;
	parts.forEach((part, index) => {
		if (!current[part]) {
			current[part] = {};
		}
		if (index + 1 === parts.length) {
			current[part] = message.toString();
		}
		current = current[part];
	});
	return system;
};



const initConnections = (config) => {
	const connections = config.connections || [];
	if (process.env.CEDALO_MC_BROKER_NAME && process.env.CEDALO_MC_BROKER_URL && process.env.CEDALO_MC_BROKER_ID) {
		let connection = connections.find((connection) => {
			return connection.name === process.env.CEDALO_MC_BROKER_NAME && connection.id === process.env.CEDALO_MC_BROKER_ID;
		});
		const connectionExisted = !!connection;
		if (connectionExisted) {

		}
		if (!connection) {
			// connection did not exist previously in configuration file
			connection = {
				name: process.env.CEDALO_MC_BROKER_NAME,
				url: process.env.CEDALO_MC_BROKER_URL,
				supportsRestart: process.env.CEDALO_MC_BROKER_SUPPORTS_RESTART === 'true' ? true : false,
				serviceName: process.env.CEDALO_MC_BROKER_SERVICE_NAME
			};
			connection.id = process.env.CEDALO_MC_BROKER_ID || uuidv4();
			if (process.env.CEDALO_MC_BROKER_USERNAME && process.env.CEDALO_MC_BROKER_PASSWORD) {
				connection.credentials = {
					username: process.env.CEDALO_MC_BROKER_USERNAME,
					password: process.env.CEDALO_MC_BROKER_PASSWORD
				};
			}
			connection.status = {
				connected: true,
				timestamp: Date.now()
			}
			connections.push(connection);
		} else {
			// connection did exist previously in configuration file
			// configuration file needs to be updated from environment variables
			connection.url = process.env.CEDALO_MC_BROKER_URL;
			connection.supportsRestart = process.env.CEDALO_MC_BROKER_SUPPORTS_RESTART === 'true' ? true : false;
			connection.serviceName = process.env.CEDALO_MC_BROKER_SERVICE_NAME;
			if (process.env.CEDALO_MC_BROKER_USERNAME && process.env.CEDALO_MC_BROKER_PASSWORD) {
				connection.credentials = {
					username: process.env.CEDALO_MC_BROKER_USERNAME,
					password: process.env.CEDALO_MC_BROKER_PASSWORD
				};
			}
		}
	}
	return connections;
};

const addStreamsheetsConfig = (config) => {
	if (!config.tools) {
		config.tools = {};
	}
	if (!config.tools.streamsheets) {
		config.tools.streamsheets = {};
	}
	if (!config.tools.streamsheets.instances) {
		config.tools.streamsheets.instances = [];
	}
	// id and url are required parameters
	if (process.env.CEDALO_STREAMSHEETS_ID && process.env.CEDALO_STREAMSHEETS_URL) {
		const exists = config.tools.streamsheets.instances.find(instance => instance.id === process.env.CEDALO_STREAMSHEETS_ID);
		if (!exists) {
			config.tools.streamsheets.instances.push({
				id: process.env.CEDALO_STREAMSHEETS_ID,
				name: process.env.CEDALO_STREAMSHEETS_NAME,
				description: process.env.CEDALO_STREAMSHEETS_DESCRIPTION,
				url: process.env.CEDALO_STREAMSHEETS_URL
			});
		}
	}
};


const stopFunctions = [];

const eventify = function(array, callback) {
    array.push = function(element) {
        Array.prototype.push.call(array, element);
        callback(array, element);
    };
};


const controlElements = {
	serverStarted: false,
	stopSignalSent: false,
	stop: null,
	logger: console
};
const stop = async () => {
	controlElements.stopSignalSent = true;
	for (const stopFunction of stopFunctions) {
		await stopFunction();
	}
	controlElements.serverStarted = false;
};
controlElements.stop = stop;

eventify(stopFunctions, async function(array, element) { // add callback to stopFunctions array, will be called on every push
	if (controlElements.stopSignalSent) { // user can send a stop signal while some async operations are still being handled and
		await element(); 				// and some stop fuinctions have not been added to the array.for example stop signal is sent while connecting a broker.
	}									// in this case as soon as the broker connected, it's stop functions which disconnects it is added to the stopFunctions array
});										// and due to the callback it checks if stop signal has already been issued and gets executed immediately.

const createOptions = (connection) => {
	// remove unwanted parameters
	const {name: _name, id: _id, status: _status, url: _url, credentials, ...restOfConnection} = connection;

	// decode all base64 encoded fields
	for (const property in restOfConnection) {
		if (restOfConnection[property]?.encoding === 'base64' && restOfConnection[property]?.data) {
			restOfConnection[property] = Buffer.from(restOfConnection[property].data, 'base64');
		} else {
			restOfConnection[property] = (restOfConnection[property] && restOfConnection[property].data) || restOfConnection[property];
		}
	}

	// compose the result together by adding credentials, the rest of the connection and connectTimeout into one options object
	return {
		...credentials,
		...restOfConnection,
		connectTimeout: process.env.CEDALO_MC_TIMOUT_MOSQUITTO_CONNECT || 5000,
	}
}



const init = async (licenseContainer) => {
	const installation = loadInstallation();
	const usageTracker = new UsageTracker({ license: licenseContainer, version, installation });
	const installationManager = new InstallationManager({ license: licenseContainer, version, installation });
	await installationManager.verifyLicense();
	const settingsManager = new SettingsManager(context);
	const maxBrokerConnections = licenseContainer?.license?.maxBrokerConnections ? parseInt(licenseContainer.license.maxBrokerConnections) : 1;
	const configManager = new ConfigManager(maxBrokerConnections);

	const loadConfig = () => {
		// const config = JSON.parse(fs.readFileSync(path.resolve(__dirname, CEDALO_MC_PROXY_CONFIG)).toString());
		const config = configManager.config;
		return config;
	};

	const globalSystem = {};
	const globalTopicTree = {};
	const app = express();
	app.set('view engine', 'ejs');
	app.set('views', path.join(__dirname, 'views'));

	const sessionParser = session({ secret: process.env.CEDALO_MC_SESSION_SECRET || generateSecret(),
									cookie: (process.env.CEDALO_MC_SESSION_MAXAGE ?
												( (parseInt(process.env.CEDALO_MC_SESSION_MAXAGE) === -1) ?
													undefined
													: {maxAge: parseInt(process.env.CEDALO_MC_SESSION_MAXAGE)}
												)
											: undefined)
									});
	app.use(sessionParser);
	app.use(express.json());
	app.use(express.urlencoded({ extended: true }));
	app.use(cors());
	app.use(contentTypeParser);
	app.use(noCache);

	// TODO: add error handling
	const config = loadConfig();
	addStreamsheetsConfig(config);
	config.parameters = {
		showFeedbackForm: CEDALO_MC_SHOW_FEEDBACK_FORM,
		showStreemsheets: CEDALO_MC_SHOW_STREAMSHEETS,
		rootUsername: CEDALO_MC_USERNAME,
		ssoUsed: false
	};

	let server;
	const host = CEDALO_MC_PROXY_HOST;
	const port = CEDALO_MC_PROXY_PORT;
	let protocol = config.plugins?.find(plugin => plugin.name === 'https') ? 'https' : 'http';

	const wss = new WebSocket.Server({
		//   port: CEDALO_MC_PROXY_PORT,
		// server,
		noServer: true,
		verifyClient: (info, done) => {
			sessionParser(info.req, {}, () => {
				const user = info.req.session?.passport?.user;
				if (user) {
					done(true);
				} else {
					done(false);
				}
			})
		}
	});


	const connections = initConnections(config);

	config.connections = connections;

	const handleConnectServerToBroker = async (connection, user) => {

		const brokerClient = new NodeMosquittoClient({
			/* logger: console */
		});
		const topicTreeManager = new TopicTreeManager(brokerClient, connection, settingsManager, context);
		topicTreeManager.addListener((topicTree, brokerClient, connection) => {
			sendTopicTreeUpdate(topicTree, brokerClient, connection);
		});

		const system = {
			_name: connection.name
		};
		globalSystem[connection.name] = system;
		globalTopicTree[connection.name] = topicTreeManager.topicTree;
		console.log(`Connecting to "${connection.name}" on ${connection.url}`);
		const connectionConfiguration = config.connections?.find(
			(connectionToSearch) => connection.id === connectionToSearch.id
		);
		if (connectionConfiguration) {
			// TODO: handle disconnection
			connectionConfiguration.status = {
				connected: false,
				timestamp: Date.now(),
			};
			configManager.updateConnection(connection.id, connectionConfiguration);
		}
		try {
			await brokerClient.connect({
				mqttEndpointURL: connection.url,
				options: createOptions(connection)
			});
			context.eventEmitter.emit('connect', connectionConfiguration);

			topicTreeManager.start();

			connectionConfiguration.status.connected = true;
			connectionConfiguration.status.timestamp = Date.now();
			console.log(`Connected to '${connection.name}' at ${connection.url}`);

			brokerClient.on('close', () => {
				context.eventEmitter.emit('close', connectionConfiguration);
				connectionConfiguration.status = {
					connected: false,
					timestamp: Date.now(),
					error: {
						errno: 1,
						code: 'ECONNCLOSED',
						syscall: 'on',
						interrupted: brokerClient.disconnectedByUser ? false : true
					}
				};
				if (brokerClient.disconnectedByUser) {
					brokerClient.disconnectedByUser = false;
				}
				sendConnectionsUpdate(brokerClient, user);
				configManager.updateConnection(connection.id, connectionConfiguration);
			});
			// this listener is applied only on reconnect (at the time we apply this listener the conenction had already been established and the first connect event alrady fired)
			brokerClient.on('connect', () => {
				context.eventEmitter.emit('reconnect', connectionConfiguration);
				connectionConfiguration.status = {
					connected: true,
					timestamp: Date.now(),
					reconnect: true
				};
				sendConnectionsUpdate(brokerClient, user);
				configManager.updateConnection(connection.id, connectionConfiguration);
			});
		} catch (error) {
			// disconnect broker client
			console.error(`Error when connecting "${connectionConfiguration.id}":`);
			console.error(error);
			connectionConfiguration.status = {
				connected: false,
				timestamp: Date.now(),
				error: error?.message || error
			};

			sendConnectionsUpdate(brokerClient, user);
			configManager.updateConnection(connection.id, connectionConfiguration);
		} finally {
			stopFunctions.push(async () => {
				await brokerClient.disconnect()
				console.log(`Disconnected from '${connection.name}' at ${connection.url}`);
			});
		}

		let error;

		if (!connectionConfiguration.status.error) {
			// means we have connected successfully
			connectionConfiguration.status = {
				connected: true,
				timestamp: Date.now()
			};
			sendConnectionsUpdate(brokerClient, user);
			configManager.updateConnection(connection.id, connectionConfiguration);
			// brokerClient.subscribe('$SYS/#', (error) => {
			// 	console.log(`Subscribed to system topics for '${connection.name}'`);
			// 	if (error) {
			// 		console.error(error);
			// 	}
			// });
			// brokerClient.subscribe('$CONTROL/dynamic-security/v1/#', (error) => {
			// 	console.log(`Subscribed to dynamic-security topics for '${connection.name}'`);
			// 	if (error) {
			// 		console.error(error);
			// 	}
			// });
			//   });
	
			brokerClient.on('message', (topic, message, packet) => {
				if (topic.startsWith('$SYS')) {
					updateSystemTopics(system, topic, message, packet);
					sendSystemStatusUpdate(system, brokerClient, connection);
				} else if (
					// TODO: change topic
					topic.startsWith('$CONTROL/dynamic-security/v1/response')
				) {
					// TODO: this is already handle by the Mosquitto client
					if (CEDALO_MC_ENABLE_FULL_LOG) {
						console.log('topic');
						console.log(topic);
						console.log(message.toString());
					}
				} else if (topic.startsWith('$CONTROL')) {
					// Nothing to do
				}
			});
		} else {
			error = connectionConfiguration.status.error;
		}

		// const proxyClient = new NodeMosquittoProxyClient({
		// 	name: `Proxy client for "${connection.name}"`,
		// 	logger: console
		// });
		// proxyClient.on('error', (message) => {
		// 	console.error(message);
		// });
		context.brokerManager.handleNewBrokerConnection(connection, brokerClient, system, topicTreeManager /*, proxyClient */);
		// configManager.updateConnection(connection.id, connectionConfiguration);
		
		// try {
		// 	await proxyClient.connect({ socketEndpointURL: 'ws://localhost:8088' });
		// 	await proxyClient.connectToBroker(connection.name);
		// 	console.log("connected");
		// } catch (error) {
		// 	console.error(error);
		// }
		return error;
	}

	const handleDisconnectServerFromBroker = async (connection) => {
		const client = context.brokerManager.getBrokerConnectionById(connection.id);
		if (client) {
			client.broker.disconnect();
		}
		context.brokerManager.handleDeleteBrokerConnection(connection);

		// if (!connection.status) {
		// 	connection.status = {};
		// }

		// connection.status.connected = false;
		// connection.status.timestamp = Date.now();

		// configManager.updateConnection(connection.id, connection);
	}


	const connectServerToAllBrokers = () => {
		for (let i = 0; i < connections.length; i++) {
			if (i < maxBrokerConnections) {
				const connection = connections[i];
				const wasConnected = connection.status && connection.status.connected;
				const closedByUser = connection.status && connection.status.error && typeof connection.status.error === 'object' && connection.status.error.code === 'ECONNCLOSED' && !connection.status.error.interrupted;
				const hadError = connection.status && connection.status.error && !closedByUser;
				if (wasConnected || hadError || connection.status === undefined) { // Note that we don't connect in case broker was manually disconnected. We connect only in the three cases descirbed in if
					handleConnectServerToBroker(connections[i]);
				}
			}
		}
	}
	console.log(`Starting Mosquitto proxy server at ${protocol}://${host}:${port}`);
	

	// TODO: move somewhere else
	const userCanAccessAPI = (user, api, connection) => {
		if (api === 'stream-processing' && !context.security.acl.isConnectionAuthorized(user, context.security.acl.atLeastAdmin, connection.name)) {
			return false;
		}
		if (api === 'dynamic-security' && !context.security.acl.isConnectionAuthorized(user, context.security.acl.atLeastEditor, connection.name)) {
			return false;
		}
		return true;
	}

	const handleCommandMessage = async (message, client, user = {}) => {
		const { api, command } = message;
		const broker = context.brokerManager.getBroker(client);
		const connection = context.brokerManager.getBrokerConnectionByClient(client);
		if (!userCanAccessAPI(user, api, connection)) {
			throw new NotAuthorizedError();
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
	};

	const connectToBroker = (brokerName, client) => {
		const brokerConnection = context.brokerManager.getBrokerConnection(brokerName);
		if (brokerConnection) {
			const { broker, system, topicTreeManager } = brokerConnection;
			context.brokerManager.connectClient(client, broker, brokerConnection);
			if (broker.connected) {
				sendSystemStatusUpdate(system, broker, brokerConnection);
				sendTopicTreeUpdate(topicTreeManager.topicTree, broker, brokerConnection);
			} else {
				throw new Error('Broker not connected');
			}
		} else {
			throw new Error('Broker not found/not connected');
		}
	};

	const disconnectFromBroker = (brokerName, client) => {
		context.brokerManager.disconnectClient(client);  //!!
	};

	// TODO: extract in separate WebSocket API class
	const handleRequestMessage = async (message, client, user = {}) => {
		const { request } = message;
		switch (request) {
			case 'unloadPlugin': {
				const { pluginId } = message;
				if (context.security.acl.isConnectionAuthorized(user, context.security.acl.atLeastAdmin)) {
					const response = pluginManager.unloadPlugin(pluginId);
					return response;
				} else {
					throw new NotAuthorizedError();
				}
			}
			case 'loadPlugin': {
				const { pluginId } = message;
				if (context.security.acl.isConnectionAuthorized(user, context.security.acl.atLeastAdmin)) {
					const response = pluginManager.loadPlugin(pluginId);
					return response;
				} else {
					throw new NotAuthorizedError();
				}
			}
			case 'setPluginStatusAtNextStartup': {
				const { pluginId, nextStatus } = message;
				if (context.security.acl.isAdmin(user)) {
					const response = pluginManager.setPluginStatusAtNextStartup(pluginId, !!nextStatus);
					return response;
				} else {
					throw new NotAuthorizedError();
				}
			}
			case 'connectToBroker': {
				const { brokerName } = message;
				if (context.security.acl.isConnectionAuthorized(user, null, brokerName)) {
					const response = await connectToBroker(brokerName, client);
					return response;
				} else {
					throw new NotAuthorizedError();
				}
			}
			case 'disconnectFromBroker': {
				const { brokerName } = message;
				// if (context.security.acl.isConnectionAuthorized(user, null, brokerName)) {
				// we don't have to check if user is authorized to disconnect from broker, because he is already connected to it (might be that he lost permissions while being connected to the broker)
				const response = await disconnectFromBroker(brokerName, client);
				return response;
				// } else {
					// throw new NotAuthorizedError();
				// }
			}
			case 'getBrokerConnections': {
				// const connections = context.brokerManager.getBrokerConnections();
				const connections = configManager.connections;
				const filteredConnections = context.security.acl.filterAllowedConnections(connections, user.connections);
				const result = stripConnectionsCredentials(filteredConnections, user, context);
				return result;
			}
			case 'getBrokerConfigurations': {
				let configToReturn;
				if (context.security.acl.isConnectionAuthorized(user, context.security.acl.atLeastAdmin)) {
					configToReturn = JSON.parse(JSON.stringify(config));
				}
				else {
					const configCopy = JSON.parse(JSON.stringify(config));
					configCopy.connections = configCopy.connections.map(connection => {
						delete connection.credentials;
						return connection;
					});
					configToReturn = configCopy;
				}

				configToReturn.connections = context.security.acl.filterAllowedConnections(configToReturn.connections, user.connections);

				return configToReturn;
			}
			case 'getSettings': {
				if (context.security.acl.noRestrictedRoles(user)) {
					return settingsManager.settings;
				} else {
					throw new NotAuthorizedError();
				}
			}
			case 'updateSettings': {
				if (context.security.acl.isConnectionAuthorized(user, context.security.acl.atLeastAdmin)) {
					const { settings } = message;
					settingsManager.updateSettings(
						{
							...settingsManager.settings,
							...settings
						}
					);
					if (settingsManager.settings.allowTrackingUsageData) {
						const data = Object.values(globalSystem);
						usageTracker.send({
							data,
							os: {
								arch: os.arch(),
								cpus: os.cpus(),
								platform: os.platform(),
								release: os.release(),
								version: os.version(),
							}
						});
					}
					return settingsManager.settings;
				} else {
					throw new NotAuthorizedError();
				}
			}
			case 'testConnection': {
				if (context.security.acl.noRestrictedRoles(user)) {
					const { connection } = message;
					const testClient = new NodeMosquittoClient({
						/* logger: console */
					});
          
          			const filteredConnection = configManager.filterConnectionObject(connection);
					filteredConnection.reconnectPeriod = 0; // add reconnectPeriod to MQTTjsClient so that it does not try to constantly reconnect on unsuccessful connection

					// try {
					await testClient.connect({
						mqttEndpointURL: filteredConnection.url,
						options: createOptions(filteredConnection)
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
				} else {
					throw new NotAuthorizedError();
				}
			}
			case 'createConnection': {
				const { connection } = message;
				if (context.security.acl.isConnectionAuthorized(user, context.security.acl.atLeastAdmin, null, null, 'createConnection')) {
					try {
						if (configManager.connections.length < context.licenseContainer.license.maxBrokerConnections) {
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
				} else {
					throw new NotAuthorizedError();
				}
			}
			case 'modifyConnection': {
				const { oldConnectionId, connection } = message;
				if (context.security.acl.isConnectionAuthorized(user, context.security.acl.atLeastAdmin, null, oldConnectionId)) {
					configManager.updateConnection(oldConnectionId, connection);

					return configManager.connections;
				} else {
					throw new NotAuthorizedError();
				}
			}
			case 'deleteConnection': {
				try {
					const { id } = message;
					if (context.security.acl.isConnectionAuthorized(user, context.security.acl.atLeastAdmin, null, id)) {
						const connection = configManager.getConnection(id);
						if (connection.cluster) {
							throw new Error(`Could not delete "${id}" because it's part of the cluster "${connection.cluster}". Delete cluster first`);
						}
						configManager.deleteConnection(id);
						return configManager.connections;
					} else {
						throw new NotAuthorizedError();
					}
				} catch(error) {
					throw error;	
				}
			}
			default: {
				if (context.security.acl.noRestrictedRoles(user)) {
					const handler = context.requestHandlers.get(request);
					if (handler) {
						const result = await handler[request](message, user);
						return result;
					} else {
						throw new Error(`Unsupported request: ${request}`);
					}
				} else {
					throw new NotAuthorizedError();
				}
			}
		}
	};

	const handleClientMessage = async (message, client, user = {}) => {
		if (CEDALO_MC_ENABLE_FULL_LOG) {
			console.log(message);
		}

		if (!context.security.acl.noRestrictedRoles(user) && message.type === 'command') { // don't allow commands if not enough permissions
			const responseMessage = {
				type: 'response',
				command: message?.command?.command || ('response to ' + message.type),
				requestId: message.id,
				error: (new NotAuthorizedError()).message
			};
			client.send(JSON.stringify(responseMessage));
		}

		switch (message.type) {
			case 'command': { // context.security.acl.noRestrictedRoles(user) throw new NotAuthorizedError();
				try {
					const response = await handleCommandMessage(message, client, user);
					const responseMessage = {
						type: 'response',
						command: message.command.command,
						requestId: message.id,
						...response
					};
					client.send(JSON.stringify(responseMessage));
				} catch (error) {
					// console.error(error); // TODO: uncomment
					const responseMessage = {
						type: 'response',
						command: message.command.command,
						requestId: message.id,
						error: error.message
					};
					client.send(JSON.stringify(responseMessage));
				}
				break;
			}
			case 'request': { // context.security.acl.noRestrictedRoles(user)
				try {
					const response = await handleRequestMessage(message, client, user);
					const responseMessage = {
						type: 'response',
						requestId: message.id,
						response
					};
					client.send(JSON.stringify(responseMessage));
				} catch (error) {
					// console.error(error); // TODO: uncomment
					const responseMessage = {
						type: 'response',
						requestId: message.id,
						error: error.message
					};
					client.send(JSON.stringify(responseMessage));
				}
				break;
			}
			default:
				break;
		}
	};

	const sendConnectionsUpdate = (brokerClient, user) => {
		const connections = context.configManager.connections; // context.brokerManager.getBrokerConnections(); brokerManager does not include connections that have been disconnected by the user before the start of the MMC
		let payload = connections;

		if (user) {
			payload = context.security.acl.filterAllowedConnections(connections, user.connections);
		}

		const messageObject = {
			type: 'event',
			event: {
				type: 'connections',
				payload
			}
		};
		notifyWebSocketClients(messageObject, brokerClient);
	};

	const sendSystemStatusUpdate = (system, brokerClient, brokerConnection) => {
		const messageObject = {
			type: 'event',
			event: {
				type: 'system_status',
				payload: system
			}
		};
		notifyWebSocketClients(messageObject, brokerClient, brokerConnection);
	};

	const sendTopicTreeUpdate = (topicTree, brokerClient, brokerConnection) => {
		const messageObject = {
			type: 'event',
			event: {
				type: 'topic_tree',
				payload: topicTree
			}
		};
		notifyWebSocketClients(messageObject, brokerClient, brokerConnection);
	};

	const notifyWebSocketClients = (message, brokerClient, brokerConnection) => {
		wss.clients.forEach((client) => {
			const broker = context.brokerManager.getBroker(client);
			if (broker === brokerClient) {
				// this WebSocket client is connected to this broker
				client.send(JSON.stringify(message));
			}
		});
	};

	const broadcastWebSocketMessage = (message) => {
		wss.clients.forEach((client) => {
			client.send(JSON.stringify(message));
		});
	}

	const broadcastWebSocketConnectionConnected = () => {
		const message = {
			type: 'event',
			event: {
				type: 'websocket-client-connected',
				payload: {
					webSocketClients: context.brokerManager.getClientWebSocketConnections().size
				}
			}
		}
		broadcastWebSocketMessage(message);
	}

	const broadcastWebSocketConnectionDisconnected = () => {
		const message = {
			type: 'event',
			event: {
				type: 'websocket-client-disconnected',
				payload: {
					webSocketClients: context.brokerManager.getClientWebSocketConnections().size
				}
			}
		}
		broadcastWebSocketMessage(message);
	}

	const broadcastWebSocketConnections = () => {
		const message = {
			type: 'event',
			event: {
				type: 'websocket-clients',
				payload: {
					webSocketClients: context.brokerManager.getClientWebSocketConnections().size
				}
			}
		}
		broadcastWebSocketMessage(message);
	}

	// TODO: handle disconnect of clients
	wss.on('connection', (ws, request) => {
		context.brokerManager.handleNewClientWebSocketConnection(ws);
		broadcastWebSocketConnectionConnected();
		broadcastWebSocketConnections();
		// send license information
		ws.send(
			JSON.stringify({
				type: 'event',
				event: {
					type: 'license',
					payload: {
						...licenseContainer.license,
						...licenseContainer.integrations
					}
				}
			})
		);
		// send version information
		ws.send(
			JSON.stringify({
				type: 'event',
				event: {
					type: 'version',
					payload: version
				}
			})
		);

		context.eventEmitter.on('user-updated', (updatedUser) => {
			if (updatedUser.username !== request.session?.passport?.user?.username) {
				return;
			}
			if (request.session?.passport?.user) {
				request.session.passport.user = {...request.session.passport.user, updatedUser}; // sync user
				request.user = request.session.passport.user;
				context.actions.preprocessUser(request, false); // reprocess user and generate valid connections properties
			}
		});

		ws.on('message', (message) => {
			try {
				const messageObject = JSON.parse(message);
				handleClientMessage(messageObject, ws, request.session?.passport?.user);
			} catch (error) {
				console.error(error);
			}
		});
		ws.on('close', (message) => {
			context.brokerManager.handleCloseClientWebSocketConnection(ws);
			broadcastWebSocketConnectionDisconnected();
			broadcastWebSocketConnections();
		});
	});


	const router = express.Router();
	app.use(CEDALO_MC_PROXY_BASE_PATH, router);

	context = {
		...context,
		security: {
			...context.security,
			isLoggedIn(request, response, next) {
				return next();
			}
		},
		configManager,
		app: app,
		server: null,
		router: router,
		config,
		globalSystem,
		globalTopicTree,
		licenseContainer,
		actions: {
			broadcastWebSocketMessage,
			loadConfig,
			handleConnectServerToBroker,
			handleDisconnectServerFromBroker,
			sendSystemStatusUpdate,
			sendTopicTreeUpdate,
			preprocessUser: actions.actions.preprocessUser
		},
		middleware: {
			preprocessUser: actions.actions.middleware.preprocessUser
		},
		preprocessUserFunctions: actions.preprocessUserFunctions
	};

	let httpPlainApp;
	let httpPlainServer;
	const pluginManager = new PluginManager();
	pluginManager.init(config.plugins, context, swaggerDocument);
	context.config.parameters.ssoUsed = !!pluginManager.plugins.find(plugin => plugin._meta.id.includes('_sso') && plugin._status.type === 'loaded');

	if (context.server instanceof Error) { // https plugin tried to be loaded but failed
		console.error('HTTPS not properly configured. Exiting...');
		throw new Error('Exit');
	} else if (!context.server) { // https plugin not enabled, switch to http server
		server = http.createServer(app);
		context.server = server;
		protocol = 'http';
	} else { // https plugin was successfully enabled
		server = context.server;

		if (parseInt(port) !== parseInt(HTTP_PORT)) {
			// set up plain http server
			httpPlainApp = express();
			// set up a route to redirect http to https
			httpPlainApp.get('*', function(request, response) {  
				response.redirect('https://' + request.headers.host + `:${port}` + request.url);
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
		} else {
			console.log(`HTTP to HTTPS redirect is not set up. Same port used for HTTPS and HTTP (port ${port}). Change port in CEDALO_MC_PROXY_PORT variable to solve this`);
		}
	}

	// Swagger
	const theme = config.themes?.find((theme) => theme.id === 'custom');
	let options = {};
	if (theme?.light?.logo?.path) {
		options = {
			customCss: `.topbar-wrapper img { height: 30px; content: url(${theme.light.logo.path})}`
		};
	}

	connectServerToAllBrokers();


	router.use('/api/docs', swaggerUi.serve);
	router.get('/api/docs', context.security.isLoggedIn, swaggerUi.setup(swaggerDocument));

	router.get('/api/version', context.security.isLoggedIn, (request, response) => {
		response.json(version);
	});

	router.get('/api/update', context.security.isLoggedIn, async (request, response) => {
		// const update = await HTTPClient.getInstance().get('https://api.cedalo.cloud/rest/request/mosquitto-ui/version');
		// response.json(update.data);
		response.json({});
	});

	router.get('/api/config', context.security.isLoggedIn, context.security.acl.middleware.isAdmin, (request, response) => {
		response.json(config);
	});

	router.get('/api/installation', context.security.isLoggedIn, (request, response) => {
		response.json(installation);
	});

	router.get('/api/settings', context.security.isLoggedIn, (request, response) => {
		response.json(settingsManager.settings);
	});

	router.get('/api/backend-parameters', context.security.isLoggedIn, (request, response) => {
		response.json(config.parameters);
	});

	if (!CEDALO_MC_OFFLINE) {
		const NEWSLETTER_URL = 'https://api.cedalo.cloud/rest/api/v1.0/newsletter/subscribe';
		router.get('/api/newsletter/subscribe', (request, response) => {
			response.status(200).json({
				newsletterEndpointAvailable: true
			});
		});
		router.post('/api/newsletter/subscribe', (request, response) => {
			const user = request.body;
			HTTPClient.getInstance()
				.post(NEWSLETTER_URL, user)
				.then(() => {
					response.status(200).json({
						newsletter: true
					});
				})
				.catch((error) => {
					console.error('Error when trying to subscribe for newsletter.');
					console.error(error);
				});
		});
	} else {
		router.get('/api/newsletter/subscribe', (request, response) => {
			response.status(200).json({
				newsletterEndpointAvailable: false
			});
		});
	}

	router.get('/api/config/tools/streamsheets', context.security.isLoggedIn, (request, response) => {
		if (config?.tools?.streamsheets) {
			response.json(config?.tools?.streamsheets);
		} else {
			response.json([]);
		}
	});

	router.get('/api/license', context.security.isLoggedIn, (request, response) => {
		response.json(licenseContainer.license);
	});

	router.get('/api/plugins', context.security.isLoggedIn, context.security.acl.middleware.isAdmin, (request, response) => {
		response.json(
			pluginManager.plugins.map((plugin) => {
				const removeProp = 'context';
				const {[removeProp]: removedPropFromOptions, ...restOptions} = plugin.options;
				return {
					...plugin.meta,
					...restOptions,
					status: plugin.status
				}
			})
		);
	});

	router.get('/*', 
		(request, response, next) => {
			if (request.path.includes('.png')) {
				next();
			} else {
				context.security.isLoggedIn(request, response, next);
			}
		},
		(request, response) => {
		let publicFilePath = path.join(__dirname, 'public', request.path);
		let mediaFilePath = path.join(__dirname, 'media', request.path);
		// TODO: handle better
		publicFilePath = publicFilePath.replace(CEDALO_MC_PROXY_BASE_PATH, '');
		mediaFilePath = mediaFilePath.replace(CEDALO_MC_PROXY_BASE_PATH, '');
		if (fs.existsSync(publicFilePath)) {
			response.sendFile(publicFilePath);
		} else if (fs.existsSync(mediaFilePath)) {
			response.sendFile(mediaFilePath);
		} else if (request.path.includes('/api/')) {
			response.status(404).json('Not found');
		} else {
			response.sendFile(path.join(__dirname, 'public', 'index.html'));
		}
	});
	router.use(express.static(path.join(__dirname, 'public')));

	router.use((error, request, response, next) => {
		if (error) {
			console.error(error.stack)
			response.status(500).json('Something went wrong!')
		} else {
			next();
		}
	});


	server.listen({
		host,
		port
	}, () => {
		console.log(`Started Mosquitto proxy server at ${protocol}://${host}:${server.address().port}`);
		controlElements.serverStarted = true;
	});
	server.on('upgrade', (request, socket, head) => {
		wss.handleUpgrade(request, socket, head, socket => {
			wss.emit('connection', socket, request);
		});
	});

	const intervalD = setInterval(() => {
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
	}, USAGE_TRACKER_INTERVAL);

	await checker.scheduleEvery('*/10 * * * * *', async (error, license) => {
		if (error) {
			licenseContainer.license = license;
			licenseContainer.isValid = false;
			const message = {
				type: 'event',
				event: {
					type: 'license',
					payload: {
						...licenseContainer.license,
						integrations: {
							error: licenseContainer.integrations.error
						}
					}
				}
			}
			broadcastWebSocketMessage(message);
		} else {
			licenseContainer.license = license;
			licenseContainer.isValid = true;
			const message = {
				type: 'event',
				event: {
					type: 'license',
					payload: {
						...licenseContainer.license,
						integrations: {
							error: licenseContainer?.integrations?.error
						}
					}
				}
			}
			broadcastWebSocketMessage(message);
		}
	});

	stopFunctions.push(() => server.close());
	stopFunctions.push(() => httpPlainServer?.close()); // plain server created to redirect http -> https in case https is used
	stopFunctions.push(() => {
		clearInterval(intervalD)
	});
	stopFunctions.push(() => checker.stop());
	stopFunctions.push(() => wss.close());
};

const licenseContainer = {};
(async () => {
	await checker.check(async (error, license) => {
		if (error) {
			console.error(error);
			process.exit(-1);
		}
		licenseContainer.license = license;
		licenseContainer.isValid = license.isValid;
		try {
			await init(licenseContainer);
		} catch(error) {
			console.log('Error encountered');
			console.log('Attempting graceful shutdown');
			await controlElements.stop();

			if (error.message === 'Exit') {
			} else {
				console.error(error);
			}
		}
	});
})();


module.exports = controlElements;
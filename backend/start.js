const fs = require('fs');
const os = require('os');
const path = require('path');
const http = require('http');
const EventEmitter = require('events');
const { v4: uuidv4 } = require('uuid');
const express = require('express');
const session = require('express-session');
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
const { loadInstallation } = require('./src/utils/utils');
const NotAuthorizedError = require('./src/errors/NotAuthorizedError');
const swaggerDocument = require('./swagger.js');
const Logger = require('./src/utils/Logger');

console = new Logger(console, false);

const version = require('./src/utils/version');

const CEDALO_MC_PROXY_CONFIG = process.env.CEDALO_MC_PROXY_CONFIG || '../config/config.json';
const CEDALO_MC_PROXY_PORT = process.env.CEDALO_MC_PROXY_PORT || 8088;
const CEDALO_MC_PROXY_HOST = process.env.CEDALO_MC_PROXY_HOST || 'localhost';
const CEDALO_MC_OFFLINE = process.env.CEDALO_MC_MODE === 'offline';

const CEDALO_MC_PROXY_BASE_PATH = process.env.CEDALO_MC_PROXY_BASE_PATH || '';
const USAGE_TRACKER_INTERVAL = 1000 * 60 * 60;

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
				url: process.env.CEDALO_MC_BROKER_URL
			};
			connection.id = process.env.CEDALO_MC_BROKER_ID || uuidv4();
			if (process.env.CEDALO_MC_BROKER_USERNAME && process.env.CEDALO_MC_BROKER_PASSWORD) {
				connection.credentials = {
					username: process.env.CEDALO_MC_BROKER_USERNAME,
					password: process.env.CEDALO_MC_BROKER_PASSWORD
				};
			}
			connection.status = {
				connected: true
			}
			connections.push(connection);
		} else {
			// connection did exist previously in configuration file
			// configuration file needs to be updated from environment variables
			connection.url = process.env.CEDALO_MC_BROKER_URL
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


const controlElements = {
	serverStarted: false,
	stop: null,
	logger: console
};
const stop = async () => {
	for (const stopFunction of stopFunctions) {
		await stopFunction();
	}
	controlElements.serverStarted = false;
};
controlElements.stop = stop;


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
	const settingsManager = new SettingsManager();
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

	const sessionParser = session({ secret: process.env.CEDALO_MC_SESSION_SECRET || "secret" });
	app.use(sessionParser);
	app.use(express.json());
	app.use(express.urlencoded({ extended: true }));
	app.use(cors());

	const server = http.createServer(app);

	// TODO: add error handling
	const config = loadConfig();
	addStreamsheetsConfig(config);

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

	const handleConnectServerToBroker = async (connection) => {

		const brokerClient = new NodeMosquittoClient({
			/* logger: console */
		});
		const topicTreeManager = new TopicTreeManager(brokerClient, connection, settingsManager);
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
				connected: false
			};
		}
		try {
			await brokerClient.connect({
				mqttEndpointURL: connection.url,
				options: createOptions(connection)
			});

			topicTreeManager.start();

			connectionConfiguration.status.connected = true;
			console.log(`Connected to '${connection.name}' at ${connection.url}`);
			brokerClient.on('close', () => {
				context.eventEmitter.emit('close', connectionConfiguration);
				connectionConfiguration.status = {
					connected: false,
					error: {
						errno: 1,
						code: 'ECONNCLOSED',
						syscall: 'on'
					}
				};
				sendConnectionsUpdate(brokerClient);
			});
			// TODO: this listener is not applied
			brokerClient.on('connect', () => {
				context.eventEmitter.emit('connect', connectionConfiguration);
				connectionConfiguration.status = {
					connected: true
				};
				sendConnectionsUpdate(brokerClient);
			});
		} catch (error) {
			//  //!! disconnect broker client
			console.error(error);
			connectionConfiguration.status = {
				connected: false,
				error: error
			};
			sendConnectionsUpdate(brokerClient);
		} finally {
			stopFunctions.push(async () => await brokerClient.disconnect());
		}
		brokerClient.subscribe('$SYS/#', (error) => {
			console.log(`Subscribed to system topics for '${connection.name}'`);
			if (error) {
				console.error(error);
			}
		});
		brokerClient.subscribe('#', (error) => {
			console.log(`Subscribed to all topics for '${connection.name}'`);
			if (error) {
				console.error(error);
			}
		});
		brokerClient.subscribe('$CONTROL/dynamic-security/v1/#', (error) => {
			console.log(`Subscribed to all topics for '${connection.name}'`);
			if (error) {
				console.error(error);
			}
		});
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
				console.log('topic');
				console.log(topic);
				console.log(message.toString());
			} else if (topic.startsWith('$CONTROL')) {
				// Nothing to do
			}
		});

		// const proxyClient = new NodeMosquittoProxyClient({
		// 	name: `Proxy client for "${connection.name}"`,
		// 	logger: console
		// });
		// proxyClient.on('error', (message) => {
		// 	console.error(message);
		// });
		context.brokerManager.handleNewBrokerConnection(connection, brokerClient, system, topicTreeManager /*, proxyClient */);
		configManager.updateConnection(connection.id, connection);
		
		// try {
		// 	await proxyClient.connect({ socketEndpointURL: 'ws://localhost:8088' });
		// 	await proxyClient.connectToBroker(connection.name);
		// 	console.log("connected");
		// } catch (error) {
		// 	console.error(error);
		// }
	}

	const handleDisconnectServerFromBroker = async (connection) => {
		const client = context.brokerManager.getBrokerConnectionById(connection.id);
		if (client) {
			client.broker.disconnect();
		}
		context.brokerManager.handleDeleteBrokerConnection(connection);
		connection.status.connected = false;
		configManager.updateConnection(connection.id, connection);
	}

	for (let i = 0; i < connections.length; i++) {
		if (i < maxBrokerConnections) {
			const connection = connections[i];
			const wasNotConnected = connection.status && (connection.status?.connected === false);
			const wasConnected = !wasNotConnected;
			if (wasConnected) {
				handleConnectServerToBroker(connections[i]);
			}
		}
	}

	console.log(`Started Mosquitto proxy at http://localhost:${CEDALO_MC_PROXY_PORT}`);

	// TODO: move somewhere else
	const userCanAccessAPI = (user, api) => {
		if (api === 'stream-processing' && !user.roles.includes('admin')) {
			return false;
		}
		if (api === 'dynamic-security' && !user.roles.includes('admin') && !user.roles.includes('editor')) {
			return false;
		}
		return true;
	}

	const handleCommandMessage = async (message, client, user = {}) => {
		const { api, command } = message;
		const broker = context.brokerManager.getBroker(client);
		if (!userCanAccessAPI(user, api)) {
			throw new NotAuthorizedError();
		}
		if (broker) {
			const result = await broker.sendCommandMessage(api, command);
			console.log(JSON.stringify(result));
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
				if (context.security.acl.isAdmin(user)) {
					const response = pluginManager.unloadPlugin(pluginId);
					return response;
				} else {
					throw new NotAuthorizedError();
				}
			}
			case 'loadPlugin': {
				const { pluginId } = message;
				if (context.security.acl.isAdmin(user)) {
					const response = pluginManager.loadPlugin(pluginId);
					return response;
				} else {
					throw new NotAuthorizedError();
				}
			}
			case 'connectToBroker': {
				const { brokerName } = message;
				if (context.security.acl.noRestrictedRoles(user)) {
					const response = await connectToBroker(brokerName, client);
					return response;
				} else {
					throw new NotAuthorizedError();
				}
			}
			case 'disconnectFromBroker': {
				const { brokerName } = message;
				if (context.security.acl.noRestrictedRoles(user)) {
					const response = await disconnectFromBroker(brokerName, client);
					return response;
				} else {
					throw new NotAuthorizedError();
				}
			}
			case 'getBrokerConnections': {
				// const connections = context.brokerManager.getBrokerConnections();
				if (context.security.acl.isAdmin(user)) {
					const connections = configManager.connections;
					return connections;
				} else {
					const connections = configManager.connections.map(connection => {
						const connectionCopy = Object.assign({}, connection);
						delete connectionCopy.credentials;
						return connectionCopy;
					})
					return connections;
				}
			}
			case 'getBrokerConfigurations': {
				if (context.security.acl.noRestrictedRoles(user)) {
					return config;
				} else {
					throw new NotAuthorizedError();
				}
			}
			case 'getSettings': {
				if (context.security.acl.noRestrictedRoles(user)) {
					return settingsManager.settings;
				} else {
					throw new NotAuthorizedError();
				}
			}
			case 'updateSettings': {
				if (context.security.acl.isAdmin(user)) {
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
					await testClient.connect({
						mqttEndpointURL: connection.url,
						options: createOptions(connection)
					});
					await testClient.disconnect();

					return {
						connected: true
					}
				} else {
					throw new NotAuthorizedError();
				}
			}
			case 'createConnection': {
				if (context.security.acl.isAdmin(user)) {
					const { connection } = message;
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
				if (context.security.acl.isAdmin(user)) {
					const { oldConnectionId, connection } = message;
					configManager.updateConnection(oldConnectionId, connection);

					return configManager.connections;
				} else {
					throw new NotAuthorizedError();
				}
			}
			case 'deleteConnection': {
				if (context.security.acl.isAdmin(user)) {
					const { id } = message;
					configManager.deleteConnection(id);
					return configManager.connections;
				} else {
					throw new NotAuthorizedError();
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
		return {};
	};

	const handleClientMessage = async (message, client, user = {}) => {
		console.log(message);
		switch (message.type) {
			case 'command': {
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
			case 'request': {
				try {
					const response = await handleRequestMessage(message, client, user);
					const responseMessage = {
						type: 'response',
						requestId: message.id,
						response
					};
					client.send(JSON.stringify(responseMessage));
				} catch (error) {
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

	const sendConnectionsUpdate = (brokerClient) => {
		const messageObject = {
			type: 'event',
			event: {
				type: 'connections',
				payload: context.brokerManager.getBrokerConnections()
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
		const user = request.session?.passport?.user;
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
		ws.on('message', (message) => {
			try {
				const messageObject = JSON.parse(message);
				handleClientMessage(messageObject, ws, user);
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
			sendTopicTreeUpdate
		}
	};

	const pluginManager = new PluginManager();
	pluginManager.init(config.plugins, context, swaggerDocument);

	// Swagger
	const theme = config.themes?.find((theme) => theme.id === 'custom');
	let options = {};
	if (theme?.light?.logo?.path) {
		options = {
			customCss: `.topbar-wrapper img { height: 30px; content: url(${theme.light.logo.path})}`
		};
	}
	router.use('/api/docs', context.security.isLoggedIn, swaggerUi.serve, swaggerUi.setup(swaggerDocument));

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

	if (!CEDALO_MC_OFFLINE) {
		const NEWSLETTER_URL = 'https://api.cedalo.cloud/rest/api/v1.0/newsletter/subscribe';
		router.get('/api/newsletter/subscribe', (request, response) => {
			response.status(200).send({
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
			response.status(200).send({
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
			pluginManager.plugins.map((plugin) => ({
				...plugin.meta,
				status: plugin.status
			}))
		);
	});

	router.get('/*', context.security.isLoggedIn, (request, response) => {
		let filePath = path.join(__dirname, 'public', request.path);
		// TODO: handle better
		filePath = filePath.replace(CEDALO_MC_PROXY_BASE_PATH, '');
		if (fs.existsSync(filePath)) {
			response.sendFile(filePath);
		} else {
			response.sendFile(path.join(__dirname, 'public', 'index.html'));
		}
	});

	router.use(express.static(path.join(__dirname, 'public')));

	server.listen({
		host: CEDALO_MC_PROXY_HOST,
		port: CEDALO_MC_PROXY_PORT
	}, () => {
		console.log(`Mosquitto proxy server started on port ${server.address().port}`);
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
		await init(licenseContainer);
	});
})();


module.exports = controlElements;
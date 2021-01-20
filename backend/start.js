const fs = require('fs');
const path = require('path');
const http = require('http');
const { v4: uuidv4 } = require('uuid');
const express = require('express');
const cors = require('cors');
const WebSocket = require('ws');
const axios = require('axios');
const BrokerManager = require('./src/broker/BrokerManager');
const NodeMosquittoClient = require('./src/client/NodeMosquittoClient');
const PluginManager = require('./src/plugins/PluginManager');
const UsageTracker = require("./src/usage/UsageTracker");
const InstallationManager = require("./src/usage/InstallationManager");
const SettingsManager = require("./src/settings/SettingsManager");
const { loadInstallation } = require("./src/utils/utils");

const version = {
	name: process.env.CEDALO_MC_NAME || 'Cedalo Management Center',
	version: process.env.CEDALO_MC_VERSION || '2.0',
	buildNumber: process.env.TRAVIS_BUILD_NUMBER || process.env.CEDALO_MC_BUILD_NUMBER || uuidv4(),
	buildDate: process.env.CEDALO_MC_BUILD_DATE || Date.now()
};

const CEDALO_MC_PROXY_CONFIG_DIR = process.env.CEDALO_MC_PROXY_CONFIG_DIR || '../config/config.json';
const CEDALO_MC_PROXY_PORT = process.env.CEDALO_MC_PROXY_PORT || 8088;

// const LicenseManager = require("../src/LicenseManager");
const LicenseChecker = require('./src/license/LicenseChecker');
// const licenseManager = new LicenseManager();
// await licenseManager.loadLicense();
// const license = licenseManager.getLicenseAsJSON();

let context = {
	brokerManager: new BrokerManager()
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

const updateTopicTree = (topicTree, topic, message, packet) => {
	if (!topicTree._messagesCounter) {
		topicTree._messagesCounter = 0;
	}
	topicTree._messagesCounter += 1;
	const parts = topic.split('/');
	let current = topicTree;
	let newTopic = false;
	parts.forEach((part, index) => {
		if (!current[part]) {
			// first time the topic was received
			current[part] = {
				_name: part,
				_topic: topic,
				_created: Date.now(),
				_messagesCounter: 1,
				_topicsCounter: 0
			};
			newTopic = true;
		} else {
			// topic already existed in the topic tree
			current[part]._lastModified = Date.now();
			current[part]._messagesCounter += 1;
		}
		if (parts.length - 1 === index) {
			// last item is the node where the message should be saved
			current[part]._message = message.toString();
			current[part]._cmd = packet.cmd;
			current[part]._dup = packet.dup;
			current[part]._retain = packet.retain;
			current[part]._qos = packet.qos;
		}
		current = current[part];
	});

	current = topicTree;
	if (newTopic) {
		parts.forEach((part, index) => {
			current[part]._topicsCounter += 1;
			current = current[part];
		});
	}
	return topicTree;
};

const initConnections = (config) => {
	const connections = config.connections || [];
	if (process.env.CEDALO_MC_BROKER_NAME && process.env.CEDALO_MC_BROKER_URL) {
		const connection = {
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
		connections.push(connection);
	}
	return connections;
};

const addStreamsheetsConfig = (config) => {
	if (!config.tools) {
		config.tools = {}
	}
	if (!config.tools.streamsheets) {
		config.tools.streamsheets = {};
	}
	if (!config.tools.streamsheets.instances) {
		config.tools.streamsheets.instances = [];
	}
	// id and url are required parameters
	if (process.env.CEDALO_STREAMSHEETS_ID
		&& process.env.CEDALO_STREAMSHEETS_URL) {
			config.tools.streamsheets.instances.push({
				id: process.env.CEDALO_STREAMSHEETS_ID,
				name: process.env.CEDALO_STREAMSHEETS_NAME,
				description: process.env.CEDALO_STREAMSHEETS_DESCRIPTION,
				url: process.env.CEDALO_STREAMSHEETS_URL
			})
		}
}

const loadConfig = () => {
	const config = JSON.parse(fs.readFileSync(path.resolve(__dirname, CEDALO_MC_PROXY_CONFIG_DIR)).toString());
	addStreamsheetsConfig(config);
	return config;
};

const init = (licenseContainer) => {
	// const usageTracker = new UsageTracker({ license: licenseContainer, version });
const init = async (licenseContainer) => {
	const installation = loadInstallation();
	const usageTracker = new UsageTracker({ license: licenseContainer, version, installation });
	const installationManager = new InstallationManager( { license: licenseContainer, version, installation });
	await installationManager.verifyLicense();
	const settingsManager = new SettingsManager();
	const globalSystem = {};
	const globalTopicTree = {};
	const app = express();
	app.use(cors());
	app.use(express.json());
	const server = http.createServer(app);

	// TODO: add error handling
	const config = loadConfig();

	const wss = new WebSocket.Server({
		//   port: CEDALO_MC_PROXY_PORT,
		server
	});

	const connections = initConnections(config);

	connections.forEach(async (connection) => {
		const system = {
			_name: connection.name
		};
		const topicTree = {
			_name: connection.name
		};
		globalSystem[connection.name] = system;
		globalTopicTree[connection.name] = topicTree;
		const brokerClient = new NodeMosquittoClient({
			/* logger: console */
		});
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
				credentials: connection.credentials,
				connectTimeout: process.env.CEDALO_MC_TIMOUT_MOSQUITTO_CONNECT || 5000
			});
			connectionConfiguration.status.connected = true;
			console.log(`Connected to '${connection.name}' at ${connection.url}`);
			brokerClient.on('close', () => {
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
			brokerClient.on('connect', () => {
				connectionConfiguration.status = {
					connected: true
				};
				sendConnectionsUpdate(brokerClient);
			});
		} catch (error) {
			console.error(error);
			connectionConfiguration.status = {
				connected: false,
				error: error
			};
			sendConnectionsUpdate(brokerClient);
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
				sendSystemStatusUpdate(system, brokerClient);
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
			updateTopicTree(topicTree, topic, message, packet);
			sendTopicTreeUpdate(topicTree, brokerClient);
		});
		context.brokerManager.handleNewBrokerConnection(connection, brokerClient, system, topicTree);
	});

	console.log(`Started Mosquitto proxy at http://localhost:${CEDALO_MC_PROXY_PORT}`);

	const handleCommandMessage = async (message, client) => {
		const { api, command } = message;
		const broker = context.brokerManager.getBroker(client);
		if (broker) {
			console.log(JSON.stringify(api));
			console.log(JSON.stringify(command));
			const result = await broker.sendCommandMessage(api, command);
			console.log(JSON.stringify(result));
			const response = {
				// TODO: remove users and groups properties when Mosquitto supports that API
				// data: result.data || result.users || result.groups,
				data: result.data,
				done: true
			};
			return response;
		} else {
			throw new Error('Client not connected to any broker');
		}
	};

	const connectToBroker = (brokerName, client) => {
		const brokerConnection = context.brokerManager.getBrokerConnection(brokerName);
		if (brokerConnection) {
			const { broker, system, topicTree } = brokerConnection;
			context.brokerManager.connectClient(client, broker);
			if (broker.connected) {
				sendSystemStatusUpdate(system, broker);
				sendTopicTreeUpdate(topicTree, broker);
			} else {
				throw new Error('Broker not connected');
			}
		}
	};

	const disconnectFromBroker = (brokerName, client) => {
		context.brokerManager.disconnectClient(client);
	};

	const handleRequestMessage = async (message, client) => {
		const { request } = message;
		switch (request) {
			case 'unloadPlugin': {
				const { pluginId } = message;
				const response = pluginManager.unloadPlugin(pluginId);
				return response;
			}
			case 'loadPlugin': {
				const { pluginId } = message;
				const response = pluginManager.loadPlugin(pluginId);
				return response;
			}
			case 'connectToBroker': {
				const { brokerName } = message;
				const response = await connectToBroker(brokerName, client);
				return response;
			}
			case 'disconnectFromBroker': {
				const { brokerName } = message;
				const response = await disconnectFromBroker(brokerName, client);
				return response;
			}
			case 'getBrokerConnections': {
				const connections = context.brokerManager.getBrokerConnections();
				return connections;
			}
			case 'getBrokerConfigurations': {
				return config;
			}
			case 'getSettings': {
				return settingsManager.settings;
			}
		}
		return {};
	};

	const handleClientMessage = async (message, client) => {
		switch (message.type) {
			case 'command': {
				try {
					const response = await handleCommandMessage(message, client);
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
					const response = await handleRequestMessage(message, client);
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

	const sendSystemStatusUpdate = (system, brokerClient) => {
		const messageObject = {
			type: 'event',
			event: {
				type: 'system_status',
				payload: system
			}
		};
		notifyWebSocketClients(messageObject, brokerClient);
	};

	const sendTopicTreeUpdate = (topicTree, brokerClient) => {
		const messageObject = {
			type: 'event',
			event: {
				type: 'topic_tree',
				payload: topicTree
			}
		};
		notifyWebSocketClients(messageObject, brokerClient);
	};

	const notifyWebSocketClients = (message, brokerClient) => {
		wss.clients.forEach((client) => {
			const broker = context.brokerManager.getBroker(client);
			if (broker === brokerClient) {
				client.send(JSON.stringify(message));
			}
		});
	};

	// TODO: handle disconnect of clients

	wss.on('connection', (ws) => {
		context.brokerManager.handleNewClientWebSocketConnection(ws);
		// send license information
		ws.send(
			JSON.stringify({
				type: 'event',
				event: {
					type: 'license',
					payload: licenseContainer.license
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
				handleClientMessage(messageObject, ws);
			} catch (error) {
				console.error(error);
			}
		});
	});

	app.use(express.static(path.join(__dirname, 'public')));

	app.get('/api/version', (request, response) => {
		response.json(version);
	});

	app.get('/api/update', async (request, response) => {
		// const update = await axios.get('https://api.cedalo.cloud/rest/request/mosquitto-ui/version');
		// response.json(update.data);
		response.json({});
	});

	app.get('/api/config', (request, response) => {
		response.json(config);
	});

	app.get('/api/installation', (request, response) => {
		response.json(installation);
	});

	app.get('/api/settings', (request, response) => {
		response.json(settingsManager.settings);
	});

	const NEWSLETTER_URL = 'https://api.cedalo.cloud/rest/api/v1.0/newsletter/subscribe';
	app.post('/api/newsletter/subscribe', (request, response) => {
		const user = request.body;
		axios
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

	app.get('/api/config/tools/streamsheets', (request, response) => {
		if (config?.tools?.streamsheets) {
			response.json(config?.tools?.streamsheets);
		} else {
			response.json([]);
		}
	});

	app.get('/api/license', (request, response) => {
		response.json(licenseContainer.license);
	});

	context = {
		...context,
		app,
		config,
		globalSystem,
		globalTopicTree,
		licenseContainer,
		actions: {
			loadConfig,
			sendSystemStatusUpdate,
			sendTopicTreeUpdate
		}
	};

	const pluginManager = new PluginManager();
	pluginManager.init(config.plugins, context);

	app.get('/api/plugins', (request, response) => {
		response.json(
			pluginManager.plugins.map((plugin) => ({
				...plugin.meta,
				status: plugin.status
			}))
		);
	});

	app.get('*', (request, response) => {
		response.sendFile(path.join(__dirname, 'public', 'index.html'));
	});

	server.listen(CEDALO_MC_PROXY_PORT, () => {
		console.log(`Mosquitto proxy server started on port ${server.address().port}`);
	});

	setInterval(() => {
		const data = Object.values(globalSystem);
		if (settingsManager.settings.allowTrackingUsageData) {
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
	}, 5000);
};

const licenseContainer = {};
const checker = new LicenseChecker();
checker.check(async (license) => {
	licenseContainer.license = license;
	licenseContainer.isValid = license.isValid;
	await init(licenseContainer);
});

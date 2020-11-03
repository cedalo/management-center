const http = require("http");
const express = require("express");
const cors = require('cors');
const WebSocket = require("ws");
const mqtt = require("mqtt");
const NodeMosquittoClient = require("./src/client/NodeMosquittoClient");
// const UsageTracker = require("./src/usage/UsageTracker");

const defaultTheme = {
	"id": "cedalo",
	"name": "Cedalo AG",
	"logo": {
		"path": "/logo.png"
	},
	"light": {
		"palette": {
			"primary": {
				"main": "#556cd6"
			},
			"secondary": {
				"main": "#19857b"
			}
		}
	},
	"dark": {
		"palette": {
			"primary": {
				"main": "rgb(16, 30, 38)"
			},
			"secondary": {
				"main": "#ffc107"
			},
			"text": {
				"primary": "rgb(156, 215, 247)"
			},
			"background": {
				"default": "rgb(6, 31, 47)",
				"paper": "rgb(16, 30, 38)"
			 }
		}
	}
	// "dark": {
	// 	"palette": {
	// 		"primary": {
	// 			"main": "#556cd6"
	// 		},
	// 		"secondary": {
	// 			"main": "#33c9dc"
	// 		}
	// 	}
	// }
}

const version = {
	version: process.env.MOSQUITTO_UI_VERSION
		|| '0.9-alpha',
	buildNumber: process.env.TRAVIS_BUILD_NUMBER
		|| process.env.MOSQUITTO_UI_BUILD_NUMBER
		|| uuidv4(),
	buildDate: process.env.MOSQUITTO_UI_BUILD_DATE
		|| Date.now(),
};

const MOSQUITTO_UI_PROXY_CONFIG_DIR = process.env.MOSQUITTO_UI_PROXY_CONFIG_DIR || "../config/config.json";
const MOSQUITTO_UI_PROXY_PORT = process.env.MOSQUITTO_UI_PROXY_PORT || 8088;

// const LicenseManager = require("../src/LicenseManager");
const LicenseChecker = require("./src/license/LicenseChecker");
// const licenseManager = new LicenseManager();
// await licenseManager.loadLicense();
// const license = licenseManager.getLicenseAsJSON();


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
	const parts = topic.split("/");
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
	const parts = topic.split("/");
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
			_topicsCounter: 0,
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
	if (process.env.MOSQUITTO_UI_BROKER_NAME
		&& process.env.MOSQUITTO_UI_BROKER_URL) {
			const connection = {
				name: process.env.MOSQUITTO_UI_BROKER_NAME,
				url: process.env.MOSQUITTO_UI_BROKER_URL
			}
			connection.id = process.env.MOSQUITTO_UI_BROKER_ID || uuidv4();
			if (process.env.MOSQUITTO_UI_BROKER_USERNAME
				&& process.env.MOSQUITTO_UI_BROKER_PASSWORD) {
				connection.credentials = {
					username: process.env.MOSQUITTO_UI_BROKER_USERNAME,
					password: process.env.MOSQUITTO_UI_BROKER_PASSWORD
				}
			}
			connections.push(connection);
	}
	return connections;
}

const brokerConnections = new Map();
const clientConnections = new Map();
const clientBrokerMappings = new Map();

const loadConfig = () => {
	const config = JSON.parse(fs.readFileSync(path.resolve(__dirname, MOSQUITTO_UI_PROXY_CONFIG_DIR)).toString());
	return config;
}

const init = (licenseContainer) => {

	// const usageTracker = new UsageTracker({ license: licenseContainer, version });
	const globalSystem = {};
	const globalTopicTree = {};
	const app = express();
	app.use(cors());
	const server = http.createServer(app);

	// TODO: add error handling
	const config = loadConfig();

	const wss = new WebSocket.Server({
		//   port: MOSQUITTO_UI_PROXY_PORT,
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
		const brokerClient = new NodeMosquittoClient({ /* logger: console */ });
		console.log(`Connecting to "${connection.name}" on ${connection.url}`);
		const connectionConfiguration = config.connections.find(connectionToSearch => connection.id === connectionToSearch.id);
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
				connectTimeout: process.env.MOSQUITTO_UI_TIMOUT_MOSQUITTO_CONNECT || 5000,
			});
			connectionConfiguration.status.connected = true;
		} catch (error) {
			console.error(error);
			connectionConfiguration.status = {
				connected: false,
				error: error
			};
		}
		console.log(`Connected to '${connection.name}' at ${connection.url}`);
		// const brokerClient = mqtt.connect(connection.url, {
		// 	username: connection.credentials?.username,
		// 	password: connection.credentials?.password
		//   });
		// brokerClient.on("connect", () => {
		// 	console.log(`Connected to '${connection.name}' at ${connection.url}`);
			brokerClient.subscribe("$SYS/#", (error) => {
				console.log(`Subscribed to system topics for '${connection.name}'`);
			if (error) {
				console.error(error);
			}
			});
			brokerClient.subscribe("#", (error) => {
				console.log(`Subscribed to all topics for '${connection.name}'`);
			if (error) {
				console.error(error);
			}
			brokerClient.subscribe("$CONTROL/dynamic-security/v1/#", (error) => {
				console.log(`Subscribed to all topics for '${connection.name}'`);
				if (error) {
					console.error(error);
				}
			});
		//   });
		brokerClient.on("message", (topic, message, packet) => {
			if (topic.startsWith("$SYS")) {
			updateSystemTopics(system, topic, message, packet);
			sendSystemStatusUpdate(system, brokerClient);
			} else if (
				// TODO: change topic
				topic.startsWith("$CONTROL/v1/response")
			) {
				// TODO: this is already handle by the Mosquitto client
				console.log("topic")
				console.log(topic)
				console.log(message.toString());
			} else if (topic.startsWith("$CONTROL")) {
				// Nothing to do
			}
			updateTopicTree(topicTree, topic, message, packet);
			sendTopicTreeUpdate(topicTree, brokerClient);
		});
		brokerConnections.set(connection.name, {
				broker: brokerClient,
			system,
			topicTree
		});
	});

	console.log(
	`Started Mosquitto proxy at http://localhost:${MOSQUITTO_UI_PROXY_PORT}`
	);


	const handleCommandMessage = async (message, client) => {
	const { api, command } = message;
	// TODO: get broker the client is currently connected to
	const broker = clientBrokerMappings.get(client);
	if (broker) {
		console.log(JSON.stringify(api));
		console.log(JSON.stringify(command));
		const result = await broker.sendCommandMessage(api, command);
		console.log(JSON.stringify(result));
		const response = {
			// TODO: remove users and groups properties when Mosquitto supports that API
			// data: result.data || result.users || result.groups,
			data: result.data,
			done: true,
		};
		return response;
	} else {
		throw new Error('Client not connected to any broker');
	}
	};

	const connectToBroker = (brokerName, client) => {
		const brokerConnection = brokerConnections.get(brokerName);
		if (brokerConnection) {
			const { broker, system, topicTree } = brokerConnection;
			clientBrokerMappings.set(client, broker);
			sendSystemStatusUpdate(system, broker);
			sendTopicTreeUpdate(topicTree, broker);
		}
	}

	const disconnectFromBroker = (brokerName, client) => {
		// TODO: handle different brokers
		// const broker = brokerConnections.get(brokerName);
		clientBrokerMappings.set(client, null);
	}

	const handleRequestMessage = async (message, client) => {
		const { request } = message;
		switch (request) {
			case "connectToBroker": {
				const { brokerName } = message;
				const response = await connectToBroker(brokerName, client);
				return response;
			}
			case "disconnectFromBroker": {
				const { brokerName } = message;
				const response = await disconnectFromBroker(brokerName, client);
				return response;
			}
			case "getBrokerConnections": {
				const connections = Array.from(brokerConnections.keys());
				return connections;
			}
			case "getBrokerConfigurations": {
				return config;
			}
		}
		return {};
	}

	const handleClientMessage = async (message, client) => {
	switch (message.type) {
		case "command": {
			try {
				const response = await handleCommandMessage(message, client);
				const responseMessage = {
				type: "response",
				command: message.command.command,
				requestId: message.id,
				...response,
				};
				client.send(JSON.stringify(responseMessage));
			} catch (error) {
				const responseMessage = {
					type: "response",
					command: message.command.command,
					requestId: message.id,
					error: error.message
				};
				client.send(JSON.stringify(responseMessage));
			}
			break;
		}
		case "request": {
			const response = await handleRequestMessage(message, client);
			const responseMessage = {
			type: "response",
			requestId: message.id,
			response,
			};
			client.send(JSON.stringify(responseMessage));
			break;
		}
		default:
		break;
	}
	};

	const sendSystemStatusUpdate = (system, brokerClient) => {
	const messageObject = {
		type: 'event',
		event: {
			type: "system_status",
			payload: system,
		}
	};
	notifyWebSocketClients(messageObject, brokerClient);
	};

	const sendTopicTreeUpdate = (topicTree, brokerClient) => {
	const messageObject = {
		type: 'event',
		event: {
			type: "topic_tree",
			payload: topicTree,
		}
	};
	notifyWebSocketClients(messageObject, brokerClient);
	};

	const notifyWebSocketClients = (message, brokerClient) => {
	wss.clients.forEach((client) => {
		const broker = clientBrokerMappings.get(client);
		if (broker === brokerClient) {
			client.send(JSON.stringify(message));
		}
	});
	};


	// TODO: handle disconnect of clients

	wss.on("connection", (ws) => {
		clientConnections.set(ws, ws);
		const messageObject = {
			type: 'event',
			event: {
			type: "license",
			payload: licenseContainer.license,
			}
		}));
		// send version information
		ws.send(JSON.stringify({
			type: 'event',
			event: {
			type: "version",
			payload: version,
			}
		}));
	ws.on("message", (message) => {
		try {
		const messageObject = JSON.parse(message);
		handleClientMessage(messageObject, ws);
		} catch (error) {
		console.error(error);
		}
	});
	});

	app.get("/api/version", (request, response) => {
		response.json(version);
	});

	app.get("/api/config", (request, response) => {
		response.json(config);
	});

	app.get("/api/connections", (request, response) => {
		response.json(config.connections);
	});

	app.get("/api/license", (request, response) => {
		response.json(licenseContainer.license);
	});

	app.get("/api/theme", (request, response) => {
		const themes = loadConfig().themes;
		if (licenseContainer.license.isValid) {
			response.json(config.themes.find(theme => theme.id === 'custom'));
		} else {
			response.json(defaultTheme);
		}
	});
	
	app.get("/api/system/status", (request, response) => {
		response.json(globalSystem);
	});
	
	app.get("/api/system/topictree", (request, response) => {
		if (licenseContainer.license.isValid) {
			response.json(globalTopicTree);
		} else {
			response.status(404).send("Not supported with the given license.");
		}
	});
	
	app.delete("/api/system/topictree", (request, response) => {
		Object.keys(globalTopicTree).forEach(brokerName => {
			const topicTree = globalTopicTree[brokerName];
			Object.keys(topicTree).forEach((key) => { delete topicTree[key]; });
			const brokerConnection = brokerConnections.get(brokerName);
			if (brokerConnection) {
				const { broker, system, topicTree } = brokerConnection;
				sendSystemStatusUpdate(system, broker);
				sendTopicTreeUpdate(topicTree, broker);
			}
		})
		response.send();
	});

	server.listen(MOSQUITTO_UI_PROXY_PORT, () => {
		console.log(`Mosquitto proxy server started on port ${server.address().port}`);
	});

	// setInterval(() => {
	// 	const data = Object.values(globalSystem);
	// 	usageTracker.send({
	// 		data,
	// 		os: {
	// 			arch: os.arch(),
	// 			cpus: os.cpus(),
	// 			platform: os.platform(),
	// 			release: os.release(),
	// 			version: os.version(),
	// 		}
	// 	});
	// }, 5000);
}

const licenseContainer = {};
const checker = new LicenseChecker();
checker.check((license) => {
	licenseContainer.license = license;
	licenseContainer.isValid = license.isValid;
	init(licenseContainer);
});

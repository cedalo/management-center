const http = require("http");
const express = require("express");
const WebSocket = require("ws");
const mqtt = require("mqtt");
const NodeMosquittoClient = require("./src/client/NodeMosquittoClient");

const MOSQUITTO_UI_PROXY_CONFIG_DIR = process.env.MOSQUITTO_UI_PROXY_CONFIG_DIR || "../config/config.json";
const MOSQUITTO_UI_PROXY_PORT = process.env.MOSQUITTO_UI_PROXY_PORT || 8088;

// const LicenseManager = require("../src/LicenseManager");
const LicenseChecker = require("./src/license/LicenseChecker");
// const licenseManager = new LicenseManager();
// await licenseManager.loadLicense();
// const license = licenseManager.getLicenseAsJSON();

const licenseContainer = {};

const checker = new LicenseChecker();
checker.check((license) => {
	licenseContainer.license = license;
	if (!license.isValid) {
		licenseContainer.valid = false;
		console.log("License not valid");
	};
});

const globalSystem = {};
const globalTopicTree = {};
const app = express();
const server = http.createServer(app);

// TODO: add error handling
const config = require(MOSQUITTO_UI_PROXY_CONFIG_DIR);

const wss = new WebSocket.Server({
//   port: MOSQUITTO_UI_PROXY_PORT,
  server
});


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

const brokerConnections = new Map();
const clientConnections = new Map();
const clientBrokerMappings = new Map();

const initConnections = (config) => {
	const connections = config.connections || [];
	if (process.env.MOSQUITTO_UI_BROKER_NAME
		&& process.env.MOSQUITTO_UI_BROKER_URL) {
			const connection = {
				name: process.env.MOSQUITTO_UI_BROKER_NAME,
				url: process.env.MOSQUITTO_UI_BROKER_URL
			}
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
const connections = initConnections(config);

connections.forEach(async (connection) => {
	const system = {};
	const topicTree = {};
	globalSystem[connection.name] = system;
	globalTopicTree[connection.name] = topicTree;
	const brokerClient = new NodeMosquittoClient({ /* logger: console */ });
	console.log(`Connecting to "${connection.name}" on ${connection.url}`);
	try {
		await brokerClient.connect({
		  mqttEndpointURL: connection.url,
		  connectTimeout: process.env.MOSQUITTO_UI_TIMOUT_MOSQUITTO_CONNECT || 5000,
		});
	} catch (error) {
		console.error(error);
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
		});
	//   });
	  brokerClient.on("message", (topic, message) => {
		if (topic.startsWith("$SYS")) {
		  updateSystemTopics(system, topic, message);
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
		} else {
		  updateTopicTree(topicTree, topic, message);
		  sendTopicTreeUpdate(topicTree, brokerClient);
		}
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

const handleCommandMessage = async (message, client) => {
  const { api, command } = message;
  // TODO: get broker the client is currently connected to
  const broker = clientBrokerMappings.get(client);
  if (broker) {
	const result = await broker.sendCommandMessage(api, command);
	console.log(JSON.stringify(api))
	console.log(JSON.stringify(command))
	console.log(JSON.stringify(result))
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
	};
	ws.send(JSON.stringify(messageObject));
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
	response.json({
		version: '2.0',
		buildNumber: '1',
	});
});

app.get("/api/license", (request, response) => {
	response.json(licenseContainer.license);
});
  
app.get("/api/system/status", (request, response) => {
	response.json(globalSystem);
});
  
app.get("/api/system/topictree", (request, response) => {
	response.json(globalTopicTree);
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
    console.log(`Mosquitto proxy server started on port ${server.address().port} :)`);
});

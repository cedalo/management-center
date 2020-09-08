const WebSocket = require("ws");
const mqtt = require("mqtt");

const MOSQUITTO_UI_PROXY_CONFIG_DIR = process.env.MOSQUITTO_UI_PROXY_PORT || "../config/config.json";
const MOSQUITTO_UI_PROXY_PORT = process.env.MOSQUITTO_UI_PROXY_PORT || 8088;


// TODO: add error handling
const config = require(MOSQUITTO_UI_PROXY_CONFIG_DIR);

const wss = new WebSocket.Server({
  port: MOSQUITTO_UI_PROXY_PORT,
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
  
  
  const updateTopicTree = (topicTree, topic, message) => {
	const parts = topic.split("/");
	let current = topicTree;
	parts.forEach((part, index) => {
	  if (!current[part]) {
		current[part] = {};
	  }
	  current = current[part];
	});
	return topicTree;
  };

const brokerConnections = new Map();
const clientConnections = new Map();
const clientBrokerMappings = new Map();

const connections = config.connections || [];
connections.forEach((connection) => {
	const system = {};
	const topicTree = {};
	const brokerClient = mqtt.connect(connection.url, {
		username: connection.credentials?.username,
		password: connection.credentials?.password
	  });
	brokerClient.on("connect", () => {
		console.log(`Connected to '${connection.name}' at ${connection.url}`);
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
	  });
	  brokerClient.on("message", (topic, message) => {
		if (topic.startsWith("$SYS")) {
		  updateSystemTopics(system, topic, message);
		  sendSystemStatusUpdate(system, brokerClient);
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


const timeoutHandler = (requestId, requests) => {
	const { reject } = deletePendingRequest(requestId, requests);
	reject({
		message: 'Mosquitto Proxy: Timeout',
		requestId
	});
};

const handleCommandMessage = async (message, client) => {
  const { command } = message;
  console.log("Sending command to Mosquitto");
  console.log(command);
  // TODO: get broker the client is currently connected to
  const broker = clientBrokerMappings.get(client);
  if (broker) {
	// TODO: send MQTT message to Mosquitto
	const response = {
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
			  response,
			};
			console.log(responseMessage);
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
  ws.on("message", (message) => {
    try {
      const messageObject = JSON.parse(message);
      handleClientMessage(messageObject, ws);
    } catch (error) {
      console.error(error);
    }
  });
});

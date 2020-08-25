const WebSocket = require("ws");
const mqtt = require("mqtt");
const config = require("./config.json");

const system = {};
const topicTree = {};

const MOSQUITTO_PROXY_PORT = process.env.MOSQUITTO_PROXY_PORT || 8088;

const wss = new WebSocket.Server({
  port: MOSQUITTO_PROXY_PORT,
});

const connections = config.connections || [];
connections.forEach((connection) => {
	const brokerClient = mqtt.connect(connection.url, {
		username: connection.credentials?.username,
		password: connection.credentials?.password
	  });
	brokerClient.on("connect", () => {
		console.log(`Connected to '${connection.name}' at ${connection.url}`);
		brokerClient.subscribe("$SYS/#", (error) => {
		  if (error) {
			console.error(error);
		  }
		});
		brokerClient.subscribe("#", (error) => {
		  if (error) {
			console.error(error);
		  }
		});
	  });
});

console.log(
  `Started Mosquitto proxy at http://localhost:${MOSQUITTO_PROXY_PORT}`
);

const MOSQUITTO_URL = process.env.MOSQUITTO_URL || "mqtt://localhost:1885";
const MOSQUITTO_USERNAME = process.env.MOSQUITTO_USERNAME || "cedalo";
const MOSQUITTO_PASSWORD = process.env.MOSQUITTO_PASSWORD || "r35aJkR!&dz";

const client = mqtt.connect(MOSQUITTO_URL, {
  username: MOSQUITTO_USERNAME,
  password: MOSQUITTO_PASSWORD,
});

client.on("connect", () => {
  console.log(`Connected to Mosquitto at ${MOSQUITTO_URL}`);
  client.subscribe("$SYS/#", (error) => {
    if (error) {
      console.error(error);
    }
  });
  client.subscribe("#", (error) => {
    if (error) {
      console.error(error);
    }
  });
});

client.on("message", (topic, message) => {
	if (topic.startsWith("$SYS")) {
	  updateSystemTopics(system, topic, message);
	  sendSystemStatusUpdate();
	} else {
	  updateTopicTree(topicTree, topic, message);
	  sendTopicTreeUpdate();
	}
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

const handleCommandMessage = async (message) => {
  const { command } = message;
  console.log("Sending command to Mosquitto");
  console.log(command);
  // TODO: send MQTT message to Mosquitto
  const response = {
    done: true,
  };
  return response;
};

const handleClientMessage = async (message, client) => {
  switch (message.type) {
    case "command":
      const response = await handleCommandMessage(message);
      const responseMessage = {
        type: "response",
        command: message.command.command,
        requestId: message.id,
        response,
      };
      console.log(responseMessage);
      client.send(JSON.stringify(responseMessage));
      break;
    default:
      break;
  }
};

const sendSystemStatusUpdate = () => {
  const messageObject = {
	  type: 'event',
	  event: {
		type: "system_status",
		payload: system,
	  }
  };
  notifyWebSocketClients(messageObject);
};

const sendTopicTreeUpdate = () => {
  const messageObject = {
	  type: 'event',
	  event: {
		type: "topic_tree",
		payload: topicTree,
	  }
  };
  notifyWebSocketClients(messageObject);
};

const notifyWebSocketClients = (message) => {
  wss.clients.forEach((client) => {
    client.send(JSON.stringify(message));
  });
};

wss.on("connection", (ws) => {
  ws.on("message", (message) => {
    try {
      const messageObject = JSON.parse(message);
      handleClientMessage(messageObject, ws);
    } catch (error) {
      console.error(error);
    }
  });

  sendSystemStatusUpdate();
  sendTopicTreeUpdate();
});

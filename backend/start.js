const WebSocket = require("ws");
const mqtt = require("mqtt");
const client = mqtt.connect(process.env.MOSQUITTO_URL, {
  username: process.env.MOSQUITTO_USERNAME || "",
  password: process.env.MOSQUITTO_PASSWORD || "",

const wss = new WebSocket.Server({
  port: 8088,
});

});
client.on("connect", () => {
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

const system = {};

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

const topicTree = {};

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

const handleClientMosquittoMessage = (message) => {
  const { command } = message;
  console.log("Sending command to Mosquitto");
  console.log(command);
};

const handleClientMessage = (message) => {
  switch (message.type) {
    case "mosquitto":
      handleClientMosquittoMessage(message);
      break;
    default:
      break;
  }
};

const sendSystemStatusUpdate = () => {
	const messageObject = {
		type: 'system_status',
		payload:system
	}
	notifyWebSocketClients(messageObject);	
}

const sendTopicTreeUpdate = () => {
	const messageObject = {
		type: 'topic_tree',
		payload: topicTree
	}
	notifyWebSocketClients(messageObject);	
}

const notifyWebSocketClients = (message) => {
  wss.clients.forEach((client) => {
    client.send(JSON.stringify(message));
  });
};

client.on("message", (topic, message) => {
	if (topic.startsWith("$SYS")) {
		updateSystemTopics(system, topic, message);	
		sendSystemStatusUpdate();
	} else {
		updateTopicTree(topicTree, topic, message);
		sendTopicTreeUpdate();
	}
});

wss.on("connection", (ws) => {
  ws.on("message", (message) => {
    try {
      const messageObject = JSON.parse(message);
	  handleClientMessage(messageObject);
    } catch (error) {
      console.error(error);
    }
  });

});

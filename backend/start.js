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

const handleClientMessage = message => {
	switch(message.type) {
		case 'mqtt': 
			handleClientMQTTMessage(message);
			break;
		default:
			break;
	}
}

client.on("message", (topic, message) => {
  updateSystemTopics(system, topic, message);
  console.log(JSON.stringify(system, null, 2));
  console.log(system.$SYS?.broker?.clients?.connected);
  client.end();
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

  ws.send(JSON.stringify(system));
});

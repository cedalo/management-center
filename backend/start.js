const mqtt = require("mqtt");
const client = mqtt.connect(process.env.MOSQUITTO_URL, {
  username: process.env.MOSQUITTO_USERNAME || "",
  password: process.env.MOSQUITTO_PASSWORD || "",
});
client.on("connect", () => {
  client.subscribe("$SYS/#", (error) => {
    if (!error) {
    } else {
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

client.on("message", (topic, message) => {
  updateSystemTopics(system, topic, message);
  console.log(JSON.stringify(system, null, 2));
  console.log(system.$SYS?.broker?.clients?.connected);
  client.end();
});

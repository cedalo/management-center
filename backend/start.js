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

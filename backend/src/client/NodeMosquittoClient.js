const mqtt = require('mqtt');
const BaseMosquittoClient = require('./BaseMosquittoClient');

module.exports = class NodeMosquittoClient extends BaseMosquittoClient {
	constructor({ name = 'Node Mosquitto Client', logger } = {}) {
		super({ name, logger: logger });
	}

	_connectBroker(url) {
		return new Promise((resolve, reject) => {
			const brokerClient = mqtt.connect(url);
			brokerClient.on("connect", () => {
			  this.logger.log(`Connected to ${url}`);
			  brokerClient.subscribe("$CONTROL/#", (error) => {
				this.logger.log(`Subscribed to control topics `);
				if (error) {
				  this.logger.error(error);
				  reject(error);
				}
				resolve(brokerClient);
			  });
			  brokerClient.on("message", (topic, message) => this._handleBrokerMessage(topic, message.toString()));
			});
		});
	}
};

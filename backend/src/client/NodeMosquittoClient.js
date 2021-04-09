const mqtt = require('mqtt');
const BaseMosquittoClient = require('./BaseMosquittoClient');

module.exports = class NodeMosquittoClient extends BaseMosquittoClient {
	constructor({ name = 'Node Mosquitto Client', logger } = {}) {
		super({ name, logger: logger });
	}

	_connectBroker(url, credentials, connectTimeout) {
		return new Promise((resolve, reject) => {
			const brokerClient = mqtt.connect(url, {
				username: credentials?.username,
				password: credentials?.password,
				connectTimeout
			});
			brokerClient.on('error', (error) => {
				this.logger.error(error);
				reject(error);
			});
			this._client = brokerClient;
			brokerClient.on('connect', () => {
				this.logger.log(`Connected to ${url}`);
				brokerClient.subscribe('$CONTROL/#', (error) => {
					this.logger.log(`Subscribed to control topics `);
					if (error) {
						this.logger.error(error);
						reject(error);
					}
					resolve(brokerClient);
				});
				brokerClient.on('message', (topic, message) => this._handleBrokerMessage(topic, message.toString()));
			});
			brokerClient.on('disconnect', () => {
				this.logger.log(`Disonnected from ${url}`);
			});
			brokerClient.on('close', () => {
				this.logger.log(`Closed connection to ${url}`);
			});
		});
	}

	async _disconnectBroker() {
		this._client.end();
	}

	on(event, callback) {
		this._client.on(event, callback);
	}

	subscribe(topic) {
		this._client.subscribe(topic);
	}
};

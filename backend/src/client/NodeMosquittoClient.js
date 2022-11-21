const mqtt = require('mqtt');

const socketErrors = [ // defined in mqttjs (client.js)
	'ECONNREFUSED',
	'EADDRINUSE',
	'ECONNRESET',
	'ENOTFOUND'
]

const BaseMosquittoClient = require('./BaseMosquittoClient');

const connectionTimeout = 5000;


module.exports = class NodeMosquittoClient extends BaseMosquittoClient {
	constructor({ name = 'Node Mosquitto Client', logger } = {}) {
		super({ name, logger: logger });
	}

	_connectBroker(url, options) {
		return new Promise((resolve, reject) => {
			if (options) {
				options.reconnectPeriod = 0;
				options.connectTimeout = connectionTimeout;
			}

			let wasConnected = false;
			// an ugly way to make mqttClient throw openssl errors instead of silencing them
			const brokerClient = mqtt.connect(url, options);
			brokerClient.stream.on('error', (error) => {
				if (!socketErrors.includes(error.code) && error.code.startsWith('ERR_SSL')) {
					console.log('Caught SSL error:', error.code, 'Emitting error');
					brokerClient.emit('error', error)
				}
			});

			brokerClient.on("offline", function(){
				if (!wasConnected) {
					brokerClient.end();
					reject(new Error('Connection offline due to timeout'));
				}
		    });

			brokerClient.on('error', (error) => {
				this.logger.error(error);
				reject((error.reason && new Error(error.reason)) || (error.code && new Error(error.code)) || error);
			});
			this._client = brokerClient;
			brokerClient.on('connect', () => {
				wasConnected = true;
				this.logger.log(`Connected to ${url}`);
				brokerClient.subscribe('$CONTROL/#', (error) => {
					this.logger.log(`Subscribed to control topics `);
					if (error) {
						this.logger.error(error);
						reject(error);
					}
					resolve(brokerClient);
				});
				brokerClient.subscribe('$CONTROL/cedalo/inspect/v1/#', (error) => {});
				brokerClient.subscribe('$CONTROL/cedalo/license/v1/#', (error) => {});
				brokerClient.on('message', (topic, message) => this._handleBrokerMessage(topic, message.toString()));
			});
			brokerClient.on('disconnect', () => {
				this.logger.log(`Disonnected from ${url}`);
			});
			brokerClient.on('close', () => {
				this.logger.log(`Closed connection to ${url}`);
				if (!wasConnected) {
					this.logger.error(`${url} closed before connect`);
					brokerClient.end();
					reject(new Error('Could not connect. Connection closed'));
				}
			});
		});
	}

	async _disconnectBroker() {
		this._client?.end();
	}

	on(event, callback) {
		this._client.on(event, callback);
	}

	subscribe(topic) {
		this._client.subscribe(topic);
	}
};

const mqtt = require('mqtt');

const socketErrors = [ // defined in mqttjs (client.js)
	'ECONNREFUSED',
	'EADDRINUSE',
	'ECONNRESET',
	'ENOTFOUND'
]

const BaseMosquittoClient = require('./BaseMosquittoClient');


const ATTEMPT_BACKOFF_MS = (process.env.CEDALO_MC_MQTT_CONNECT_INITIAL_BACKOFF_INTERVAL_MS
							&& Math.abs((process.env.CEDALO_MC_MQTT_CONNECT_INITIAL_BACKOFF_INTERVAL_MS))
							) || 500;
const MAX_NUMBER_OF_ATTEMPTS = (process.env.CEDALO_MC_MQTT_CONNECT_MAX_NUMBER_OF_ATTEMPTS
							&& parseInt(process.env.CEDALO_MC_MQTT_CONNECT_MAX_NUMBER_OF_ATTEMPTS)) // put 0 or -1 to indicate an indefinite reconnect
							 || 10;
const BACKOFF_RATE =  (process.env.CEDALO_MC_MQTT_CONNECT_BACKOFF_INCREASE_RATE 
						&& Math.abs(parseFloat(process.env.CEDALO_MC_MQTT_CONNECT_BACKOFF_INCREASE_RATE))
						) || 1.5;
const CONNECT_TIMEOUT_MS = 5000;


module.exports = class NodeMosquittoClient extends BaseMosquittoClient {
	constructor({ name = 'Node Mosquitto Client', logger } = {}) {
		super({ name, logger: logger });
		this._disconnectedByUser = false;
	}

	static createOptions(connection) {
		// remove unwanted parameters
		const { name: _name, id: _id, status: _status, url: _url, credentials, ...restOfConnection } = connection;

		// decode all base64 encoded fields
		for (const property in restOfConnection) {
			if (restOfConnection[property]?.encoding === 'base64' && restOfConnection[property]?.data) {
				restOfConnection[property] = Buffer.from(restOfConnection[property].data, 'base64');
			} else {
				restOfConnection[property] =
					(restOfConnection[property] && restOfConnection[property].data) || restOfConnection[property];
			}
		}

		// compose the result together by adding credentials, the rest of the connection and connectTimeout into one options object
		return {
			...credentials,
			...restOfConnection,
			connectTimeout: process.env.CEDALO_MC_TIMOUT_MOSQUITTO_CONNECT || 5000
		};
	}

	_connectBroker(url, options) {
		return new Promise((resolve, reject) => {
			if (options) {
				options.reconnectPeriod = 0;
				options.connectTimeout = CONNECT_TIMEOUT_MS;
			}

			let timeoutID = undefined;
			let wasConnected = false; // maybe delete this
			let attemptNumber = 1;
			let attemptBackoffMs = ATTEMPT_BACKOFF_MS;
			// an ugly way to make mqttClient throw openssl errors instead of silencing them
			const brokerClient = mqtt.connect(url, options);
			brokerClient.stream.on('error', (error) => {
				if (!socketErrors.includes(error.code) && error.code.startsWith('ERR_SSL')) {
					console.log('Caught SSL error:', error.code, 'Emitting error');
					brokerClient.emit('error', error);
				}
			});

			brokerClient.on('offline', function(){
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
				attemptNumber = 1;
				attemptBackoffMs = ATTEMPT_BACKOFF_MS;
				wasConnected = true;
				clearInterval(timeoutID);
				this.connected = true;
				this.logger.log(`Connected to ${url}`);

				brokerClient.subscribe('$CONTROL/#', (error) => {
					console.log(`Subscribed to control topics for ${url}`);
					if (error) {
						this.logger.error(error);
						reject(error);
					}
					resolve(brokerClient);
				});

				brokerClient.subscribe('$SYS/#', (error) => {
					console.log(`Subscribed to system topics for '${url}'`);
					if (error) {
						console.error(error);
					}
				});
				brokerClient.subscribe('$CONTROL/dynamic-security/v1/#', (error) => {
					console.log(`Subscribed to dynamic-security topics for '${url}'`);
					if (error) {
						console.error(error);
					}
				});
				brokerClient.subscribe('$CONTROL/cedalo/inspect/v1/#', (error) => {error && console.error(`Error subscruging to control inspect topic for ${url}`, error)});
				brokerClient.subscribe('$CONTROL/cedalo/license/v1/#', (error) => {error && console.error(`Error subscruging to control license topic for ${url}`, error)});
				brokerClient.on('message', (topic, message) => this._handleBrokerMessage(topic, message.toString())); // TODO: can we move it out of connect?
			});

			brokerClient.on('disconnect', () => {
				console.log(`Disonnected from ${url}`);
				this.logger.log(`Disonnected from ${url}`);
			});

			brokerClient.on('close', () => {
				this.connected = false;
				if (attemptNumber === 1) {
					console.log(`Closing connection to ${url}`);
					this.logger.log(`Closing connection to ${url}`);
				} else if (attemptNumber === MAX_NUMBER_OF_ATTEMPTS + 1) {
					this.logger.log(`Maximum reconnection attempts reached for ${url}`);
					console.log(`Maximum reconnection attempts reached for ${url}`);
					// brokerClient.end(); // has no effect
					return;
				}
				if (!wasConnected) {
					this.logger.error(`${url} closed before connect`);
					// brokerClient.end(); // has no effect
					return reject(new Error(`Could not connect to ${url}. Connection closed`));
				}
				if (this._disconnectedByUser) {
					this.logger.log(`Connection to ${url} closed by the user`);
					console.log(`Connection to ${url} closed by the user`);
					return;
				}
				timeoutID = setTimeout(() => { // kill set timeout in connect hanlder!!!
					this.logger.log(`Reconnecting to ${url}: attempt ${attemptNumber}; current backoff interval was: ${attemptBackoffMs} ms`);
					console.log(`Reconnecting to ${url}: attempt ${attemptNumber}; current backoff interval was: ${attemptBackoffMs} ms`);
					brokerClient.reconnect();
					attemptNumber += 1;
					attemptBackoffMs = parseInt(attemptBackoffMs * BACKOFF_RATE);
				}, attemptBackoffMs);
			});
		});
	}

	async _disconnectBroker() {
		this._disconnectedByUser = true;
		this._client?.end();
	}

	on(event, callback) {
		this._client.on(event, callback);
	}

	subscribe(topic, callback) {
		if (this._client?.connected) {
			this._client.subscribe(topic, callback);
		} 
	}

	unsubscribe(topic, callback) {
		if (this._client?.connected) {
			this._client.unsubscribe(topic, callback);
		}
	}

	get disconnectedByUser() {
		return this._disconnectedByUser;
	}

	set disconnectedByUser(value) {
		this._disconnectedByUser = value;
	}
};

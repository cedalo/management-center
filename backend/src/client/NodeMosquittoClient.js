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
const CONNECT_TIMEOUT_MS = (process.env.CEDALO_MC_MQTT_CONNECT_TIMEOUT_MS 
							&& Math.abs(parseFloat(process.env.CEDALO_MC_MQTT_CONNECT_TIMEOUT_MS))
							) || 5000;

const TOPIC_NAME = 'brokerReconnect';


//TODO: move to utils or something
const generateEventMessage = (topicName, message, rest) => {
	if (!rest) {
		rest = {};
	}

	return {
		topic: topicName,
		payload: { message, ...rest },
		datetime: (new Date()).toString()
	};
};


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


	_createConnectionHandler(url, options) {
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

		this._client = brokerClient;
		this._url = url;

		brokerClient.stream.on('error', (error) => {
			if (!socketErrors.includes(error.code) && error.code.startsWith('ERR_SSL')) {
				console.error('Caught SSL cert error:', error.code, '; Emitting error...');
				brokerClient.emit('error', error);
			} else if (!socketErrors.includes(error.code)) {
				console.error('Caught error in TLS socket:', error.code, '; Emitting error...');
				brokerClient.emit('error', error);
			}
		});

		brokerClient.on('offline', function(){
			if (!wasConnected) {
				brokerClient.end();
				this.logger.error('Connection offline due to a timeout');
				console.error('Connection offline due to a timeout');
				brokerClient.emit('error', new Error('Connection offline due to a timeout'));
			}
		});

		brokerClient.on('error', (error) => {
			this.logger.error(error);
			console.error(error);
			// reject && reject((error.reason && new Error(error.reason)) || (error.code && new Error(error.code)) || error);
		});

		brokerClient.on('connect', () => {
			attemptNumber = 1;
			attemptBackoffMs = ATTEMPT_BACKOFF_MS;
			wasConnected = true;
			clearInterval(timeoutID);
			this.connected = true;
			this.logger.log(`Connected to ${url}`);
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
				brokerClient.emit('information', generateEventMessage(
						TOPIC_NAME,
						'Maximum reconnection attempts reached',
						{ brokerId: 'todo' }
					)
				);
				return;
			}
			if (!wasConnected) {
				this.logger.error(`${url} closed before connect`);
				console.error(`${url} closed before connect`);
				// brokerClient.end(); // has no effect
				brokerClient.emit('error', new Error(`Could not connect to ${url}. Connection closed`)); // propagete the error further inside brokerClient listeners
				return;
			}
			if (this._disconnectedByUser) {
				this.logger.log(`Connection to ${url} closed by the user`);
				console.log(`Connection to ${url} closed by the user`);
				return;
			}
			timeoutID = setTimeout(() => { // kill set timeout in connect hanlder!!!
				this.logger.log(`Reconnecting to ${url}: attempt ${attemptNumber}; current backoff interval was: ${attemptBackoffMs} ms`);
				console.log(`Reconnecting to ${url}: attempt ${attemptNumber}; current backoff interval was: ${attemptBackoffMs} ms`);
				brokerClient.emit('information', generateEventMessage(
						TOPIC_NAME,
						`Reconnecting to ${url}: attempt ${attemptNumber}; current backoff interval was: ${attemptBackoffMs} ms`,
						{ attemptNumber, attemptBackoffMs, brokerId: 'todo' }
					)
				);
				brokerClient.reconnect();
				attemptNumber += 1;
				attemptBackoffMs = parseInt(attemptBackoffMs * BACKOFF_RATE);
			}, attemptBackoffMs);
		});

		return brokerClient;
	}


	_connectBroker(url, options) {
		return new Promise((resolve, reject) => {
			const timeoutHandler = setTimeout(() => {
				reject(new Error(`Connection to ${this._url} timed out`));
			}, CONNECT_TIMEOUT_MS);

			let brokerClient = this._client;

			// if brokerClient wasn't already initialised, this means that the parameters are passed and we should create a handle first. otherwise, we can just use the existing one
			if (!brokerClient) {
				if (!url || !options) {
					reject(new Error('connection handle not initialized and no arguments given, invalid call to _connectBroker'));
				}
				try {
					brokerClient = this._createConnectionHandler(url, options);
				} catch(error) {
					reject(error);
				}
			}

			brokerClient.on('close', () => {
				// promise can only be rejected once, subsequent calls are ignored, so in the fact that this code is getting called on every close connection (in case of reconnect), doesn't matter
				// we are only intereseted in the first close event which happens before any connect can occur. there is no guarantee that we will catch it with this code
				// but for such casees we have timeout hanlder in the beginning of this funciton
				// bottom line is that this is just an auxilary code and it can be safely removed/ignored (same as an error event handler below)
				reject(new Error(`Connection to ${this._url} closed`));
			});
			brokerClient.on('error', (error) => {
				// promise can only be rejected once, subsequent calls are ignored, so this code will not cause any harm when executed subsequently
				// also safe to call reject in case both close and error events are emitted which is usually the case
				reject(new Error(error));
			});

			brokerClient.on('connect', () => {
				brokerClient.subscribe('$CONTROL/#', (error) => { // critical topics, reject if unsucessful
					console.log(`Subscribed to control topics for ${this._url}`);
					if (error) {
						this.logger.error(error);
						reject(error);
					}
				});
	
				brokerClient.subscribe('$SYS/#', (error) => { // critical topics, reject if unsucessful
					console.log(`Subscribed to system topics for '${this._url}'`);
					if (error) {
						console.error(error);
						reject(error);
					}
				});
				brokerClient.subscribe('$CONTROL/dynamic-security/v1/#', (error) => { // critical topics, reject if unsucessful
					console.log(`Subscribed to dynamic-security topics for '${this._url}'`);
					if (error) {
						console.error(error);
						reject(error);
					}
				});
				brokerClient.subscribe('$CONTROL/cedalo/inspect/v1/#', (error) => {error && console.error(`Error subscruging to control inspect topic for ${this._url}`, error)});
				brokerClient.subscribe('$CONTROL/cedalo/license/v1/#', (error) => {error && console.error(`Error subscruging to control license topic for ${this._url}`, error)});
				
				brokerClient.on('message', (topic, message) => {
					this._handleBrokerMessage(topic, message.toString())
				}); // TODO: can we move it out of connect?

				clearTimeout(timeoutHandler);
				resolve(brokerClient);
			});
		});
	}

	async _disconnectBroker(isDisconnectedByUser) {
		// this function is called when user requests disconnection (then isDisconnectedByUser is set to true), but can
		// also be called be called when the connection got unexpectedly closed or error erised, then we don't set disconnecteByUser flag
		this._disconnectedByUser = !!isDisconnectedByUser;
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

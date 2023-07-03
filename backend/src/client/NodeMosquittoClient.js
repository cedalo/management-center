const mqtt = require('mqtt');
const { replaceNaN } = require('../utils/utils');

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
const MAX_NUMBER_OF_ATTEMPTS = (process.env.CEDALO_MC_MQTT_CONNECT_MAX_NUMBER_OF_ATTEMPTS || 10)
							&& replaceNaN(parseInt(process.env.CEDALO_MC_MQTT_CONNECT_MAX_NUMBER_OF_ATTEMPTS), 10); // put -1 to indicate an indefinite reconnect
							// CEDALO_MC_MQTT_CONNECT_MAX_NUMBER_OF_ATTEMPTS=0 means no reconnects will be scheduled
const BACKOFF_RATE =  (process.env.CEDALO_MC_MQTT_CONNECT_BACKOFF_INCREASE_RATE 
						&& Math.abs(parseFloat(process.env.CEDALO_MC_MQTT_CONNECT_BACKOFF_INCREASE_RATE))
						) || 1.5;
const CONNECT_TIMEOUT_MS = (process.env.CEDALO_MC_MQTT_CONNECT_TIMEOUT_MS 
							&& Math.abs(parseFloat(process.env.CEDALO_MC_MQTT_CONNECT_TIMEOUT_MS))
							) || 5000;

const TOPIC_NAME = 'brokerReconnect';
     

const TOPICS_TO_SUBSCRIBE = ['$CONTROL/#',
							'$SYS/#',
							// '$CONTROL/dynamic-security/v1/',
							// '$CONTROL/cedalo/inspect/v1/#',
							// '$CONTROL/cedalo/license/v1/#',
						]

//TODO: move to utils or something
// made to notify other parts of the program that some connection events happened
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
	constructor({ name='Node Mosquitto Client', brokerId, brokerName, logger } = {}) {
		super({ name, logger: logger, brokerId, brokerName });
		this._disconnectedByUser = false;
		this._topicsToSubscribe = TOPICS_TO_SUBSCRIBE;
		this.subscribedTopics = [];
	}

	static createOptions(connection) {
		// make a deep copy of the connection options
		connection = JSON.parse(JSON.stringify(connection));
		// remove unwanted parameters
		const { name: _name, id: _id, status: _status, url: _url, credentials, noMetricsMode, ...restOfConnection } = connection;

		// decode all base64 encoded fields
		for (const property in restOfConnection) {
			if (restOfConnection[property]?.encoding === 'base64' && restOfConnection[property]?.data) {
				restOfConnection[property] = Buffer.from(restOfConnection[property].data, 'base64');
			} else {
				restOfConnection[property] =
					(restOfConnection[property] && restOfConnection[property].data) || restOfConnection[property];
			}
		}

		// process no sysmetrics mode
		if (noMetricsMode) {
			restOfConnection.protocolVersion = 5;
			restOfConnection.properties = {
				userProperties: {
					'sys-metrics': 'none'
				}
			};
		}

		// compose the result together by adding credentials, the rest of the connection and connectTimeout into one options object
		return {
			...credentials,
			...restOfConnection,
			connectTimeout: process.env.CEDALO_MC_TIMOUT_MOSQUITTO_CONNECT || 5000
		};
	}


	_createConnectionHandler(url, options) {
		// make a shallow copy of the options. This is enough for our purposes. We don't change the nested object to need a deep copy plus deep copy is cumbersome because options contain Buffers which JSON.parse(JSON.stringify()) doesn't know how to serialize 
		options = {...options};

		if (options) {
			options.reconnectPeriod = 0;
			options.connectTimeout = CONNECT_TIMEOUT_MS;
		}

		let timeoutID = undefined;
		let wasConnected = false; // maybe delete this
		let attemptNumber = 1;
		let attemptBackoffMs = ATTEMPT_BACKOFF_MS;
		this._completeDisconnect = {value: false, reason: undefined};
		// an ugly way to make mqttClient throw openssl errors instead of silencing them
		const brokerClient = mqtt.connect(url, options);

		this._client = brokerClient;
		this._url = url;
		this._brokerIdentifier = this.brokerId || this.brokerName || this._url;

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
			this._disconnectedByUser = false;
			this.connected = true;
			this.logger.log(`Connected to ${this._brokerIdentifier}`);
			// this._completeDisconnect = {value: false, reason: undefined}; // there is no point in this line, since terminal disconnect is supposed to destroy this brokerClient object anyways.
			// in case we want to reestablish a connection after a terminal disconnect, we don't need this brokerClient. We have connections in config.json, and will create a new brokerClient
			// the only porblem is that I think there is a reference to brokerClient in topicTreeManager which doesn't allow to garbadge collect it even if we remove it from brokerMnager (need to double check tho)
		});

		brokerClient.on('disconnect', () => {
			console.log(`Disonnected from ${this._brokerIdentifier}`);
			this.logger.log(`Disonnected from ${this._brokerIdentifier}`);
		});

		brokerClient.on('close', () => {
			this.connected = false;
			if (attemptNumber === 1) {
				console.log(`Closing connection to ${this._brokerIdentifier}`);
				this.logger.log(`Closing connection to ${this._brokerIdentifier}`);
			} else if (attemptNumber === MAX_NUMBER_OF_ATTEMPTS + 1) {
				this.logger.log(`Maximum reconnection attempts reached for ${this._brokerIdentifier}`);
				console.log(`Maximum reconnection attempts reached for ${this._brokerIdentifier}`);
				// brokerClient.end(); // has no effect
				brokerClient.emit('information', generateEventMessage(
						TOPIC_NAME,
						'Maximum reconnection attempts reached', // 'MAX_NUMBER_OF_ATTEMPTS'
						{ brokerId: this.brokerId }
					)
				);
				this._completeDisconnect = {value: true, reason: 'MAX_NUMBER_OF_ATTEMPTS'};
				return;
			}
			if (!MAX_NUMBER_OF_ATTEMPTS) {
				this.logger.log(`No reconnection attempts scheduled for ${this._brokerIdentifier}. CEDALO_MC_MQTT_CONNECT_MAX_NUMBER_OF_ATTEMPTS is zero (${MAX_NUMBER_OF_ATTEMPTS})`);
				console.log(`No reconnection attempts scheduled for ${this._brokerIdentifier}. CEDALO_MC_MQTT_CONNECT_MAX_NUMBER_OF_ATTEMPTS is zero (${MAX_NUMBER_OF_ATTEMPTS})`);
				this._completeDisconnect = {value: true, reason: 'NO_RECONNECT_ATTEMPTS'};
				return;
			}
			if (!wasConnected) {
				this.logger.error(`${this._brokerIdentifier} closed before connect`);
				console.error(`${this._brokerIdentifier} closed before connect`);
				// brokerClient.end(); // has no effect
				brokerClient.emit('error', new Error(`Could not connect to ${this._brokerIdentifier}. Connection closed`)); // propagete the error further inside brokerClient listeners
				this._completeDisconnect = {value: true, reason: 'CLOSED_BEFORE_CONNECT'};
				return;
			}
			if (this._disconnectedByUser) {
				this.logger.log(`Connection to ${this._brokerIdentifier} closed by the user`);
				console.log(`Connection to ${this._brokerIdentifier} closed by the user`);
				this._completeDisconnect = {value: true, reason: 'NORMAL_DISCONNECT'};
				return;
			}
			this.logger.log(`Scheduling reconnect(s) for ${this._brokerIdentifier}`);
			console.log(`Scheduling reconnect(s) for ${this._brokerIdentifier}`);

			timeoutID = setTimeout(() => { // kill set timeout in connect hanlder!!!
				this.logger.log(`Reconnecting to ${this._brokerIdentifier}: attempt ${attemptNumber}; current backoff interval was: ${attemptBackoffMs} ms`);
				console.log(`Reconnecting to ${this._brokerIdentifier}: attempt ${attemptNumber}; current backoff interval was: ${attemptBackoffMs} ms`);
				brokerClient.emit('information', generateEventMessage(
						TOPIC_NAME,
						`Reconnecting to ${this._brokerIdentifier}: attempt ${attemptNumber}; current backoff interval was: ${attemptBackoffMs} ms`,
						{ attemptNumber, attemptBackoffMs, brokerId: this.brokerId }
					)
				);
				brokerClient.reconnect();
				attemptNumber += 1;
				attemptBackoffMs = parseInt(attemptBackoffMs * BACKOFF_RATE);
			}, attemptBackoffMs);
		});

		return brokerClient;
	}


	_subscribeToSystemTopics() {
		this._topicsToSubscribe.forEach((topicname) => {
			this.subscribe(topicname, (error) => { // critical topics, reject if unsucessful
				if (error) {
					console.error(`Error subscriting to ${topicname} topic for ${this._brokerIdentifier}:`, error);
					this.logger.error(`Error subscriting to ${topicname} topic for ${this._brokerIdentifier}: ${error}`);
					return;
				}
				console.log(`Subscribed to ${topicname} topic for ${this._brokerIdentifier}`);
				this.logger.log(`Subscribed to ${topicname} topic for ${this._brokerIdentifier}`);
			});
		});
	}

	
	_unsubscribeFromAllTopics() {
		[...this.subscribedTopics].forEach((topicname) => { // when unsubscribing from topics we mutate this array
			this.unsubscribe(topicname, (error) => { // critical topics, reject if unsucessful
				if (error) {
					console.error(`Error unsubscriting to ${topicname} topic for ${this._brokerIdentifier}:`, error);
					this.logger.error(`Error unsubscriting to ${topicname} topic for ${this._brokerIdentifier}: ${error}`);
					return;
				}
				console.log(`Unsubscribed to ${topicname} topic for ${this._brokerIdentifier}`);
				this.logger.log(`Unsubscribed to ${topicname} topic for ${this._brokerIdentifier}`);
			});
		});
	}


	_connectBroker(url, options) {
		return new Promise((resolve, reject) => {
			const timeoutHandler = setTimeout(() => {
				reject(new Error(`Connection to ${this._brokerIdentifier} timed out`));
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
				reject(new Error(`Connection to ${this._brokerIdentifier} closed`));
			});
			brokerClient.on('error', (error) => {
				// promise can only be rejected once, subsequent calls are ignored, so this code will not cause any harm when executed subsequently
				// also safe to call reject in case both close and error events are emitted which is usually the case
				reject(new Error(error));
			});

			brokerClient.on('connect', () => {
				this._subscribeToSystemTopics();

				brokerClient.on('message', (topic, message) => {
					this._handleBrokerMessage(topic, message.toString())
				}); // TODO: can we move it out of connect?

				clearTimeout(timeoutHandler);
				resolve(brokerClient);
			});
		});
	}


	async _disconnectBroker(isNormalDisconnect) {
		// this function is called when user requests disconnection (then isNormalDisconnect is set to true), but can
		// also be called be called when the connection got unexpectedly closed or error erised, then we don't set disconnecteByUser flag
		this._disconnectedByUser = !!isNormalDisconnect;
		this._unsubscribeFromAllTopics();
		this._client?.end();
	}

	on(event, callback) {
		this._client.on(event, callback);
	}

	subscribe(topic, callback) {
		if (this._client?.connected) {
			if (!this.subscribedTopics.includes(topic)) {
				this.subscribedTopics.push(topic);
			}

			this._client.subscribe(topic, (...args) => {
				const error = args[0];
				if (error) {
					const index = this.subscribedTopics.indexOf(topic)
					if (index) {
						this.subscribedTopics.splice(index, 1);
					}
				}
				callback(...args);
			});
		}
	}

	unsubscribe(topic, callback) {
		if (this._client?.connected) {
			const index = this.subscribedTopics.indexOf(topic)
			if (index) {
				this.subscribedTopics.splice(index, 1);
			}

			this._client.unsubscribe(topic, (...args) => {
				const error = args[0];
				if (error) {
					this.subscribedTopics.push(topic);
				}
				callback(...args);
			});
		}
	}

	get disconnectedByUser() {
		return this._disconnectedByUser;
	}

	set disconnectedByUser(value) {
		this._disconnectedByUser = value;
	}

	get completeDisconnect() {
		return this._completeDisconnect;
	}

	set completeDisconnect(value) {
		return this._completeDisconnect = value;
	}
};

const { v1: uuid } = require('uuid');

const createError = (code, message) => ({
	code,
	message
});

// TODO: merge with method deletePendingRequest()
const deletePendingRequest = (correlationData, requests) => {
	const request = requests.get(correlationData);
	if (request) {
		clearTimeout(request.timeoutId);
		requests.delete(correlationData);
	}
	return request;
};
const timeoutHandler = (correlationData, requests) => {
	const { reject } = deletePendingRequest(correlationData, requests);
	reject({
		message: 'BaseMosquittoClient: Timeout',
		correlationData
	});
};

const createID = () => uuid();

module.exports = class BaseMosquittoClient {
	constructor({ name, logger, defaultListener } = {}) {
		this.name = name || 'Default Base Mosquitto Client';
		this._logger = logger || {
			log() {},
			info() {},
			warn() {},
			debug() {},
			error() {}
		};
		this._eventHandler = (event) => this.logger.info(event);
		this._closeHandler = () => this.logger.info('Close Mosquitto Client');
		this._eventListeners = new Map();
		this._isConnected = false;
		this._requests = new Map();
		// TODO: make timeout configurable
		// request timeout in ms:
		this._timeout = 2000;
	}

	// eslint-disable-next-line consistent-return
	async connect({ mqttEndpointURL, credentials, connectTimeout } = {}) {
		if (this._isConnected || this._isConnecting) {
			return Promise.resolve({});
		}
		this._isConnecting = true;
		this._mqttEndpointURL = mqttEndpointURL || this._mqttEndpointURL;
		try {
			const brokerClient = await this._connectBroker(mqttEndpointURL, credentials, connectTimeout);
			this._brokerClient = brokerClient;
			this._isConnected = true;
		} catch (error) {
			this._isConnected = false;
			this.logger.error(error);
			throw error;
		}
	}

	async disconnect() {
		await this._disconnectBroker();
	}

	get logger() {
		return this._logger;
	}

	get url() {
		return this._mqttEndpointURL;
	}

	/**
	 * ******************************************************************************************
	 * Method for sending command messages
	 * ******************************************************************************************
	 */

	async sendCommandMessage(feature, commandMessage) {
		return this._sendCommands(feature, commandMessage);
	}

	on(event, listener) {
		let listeners = this._eventListeners.get(event);
		if (!listeners) {
			listeners = [];
			this._eventListeners.set(event, listeners);
		}
		listeners.push(listener);
	}

	off(event, listener) {
		const listeners = this._eventListeners.get(event);
		if (listeners) {
			const index = listeners.indexOf(listener);
			if (index > -1) {
				listeners.splice(index, 1);
			}
		}
	}

	set eventHandler(eventHandler) {
		this._eventHandler = eventHandler;
	}

	get eventHandler() {
		return this._eventHandler;
	}

	set closeHandler(closeHandler) {
		this._closeHandler = closeHandler;
	}

	get closeHandler() {
		return this._closeHandler;
	}

	async _sendCommands(feature, commandMessage, correlationData = createID()) {
		commandMessage.correlationData = correlationData;
		const commands = {
			commands: [commandMessage]
		};
		return this.sendRequest(feature, commands, correlationData);
	}

	async sendRequest(feature, request, correlationData = createID(), timeout = this._timeout) {
		/* eslint-disable */
		this.logger.debug('Sending request to Mosquitto', request);
		return new Promise((resolve, reject) => {
			const timeoutId = setTimeout(() => timeoutHandler(correlationData, this._requests), timeout);
			this._requests.set(correlationData, {
				resolve,
				reject,
				timeoutId,
				request
			});
			return new Promise((resolve, reject) => {
				if (!this._brokerClient) {
					reject(new Error('Not connected to broker'));
				} else {
					if (feature) {
						this._brokerClient.publish(`$CONTROL/${feature}/v1`, JSON.stringify(request));
					} else {
						this._brokerClient.publish(`$CONTROL`, JSON.stringify(request));
					}
					resolve();
				}
			}).catch((error) => {
				this.logger.error('Sending request to Mosquitto', request);
				this.logger.error(
					`Error while communicating with Mosquitto while executing request '${request}'`,
					error
				);
				reject(error);
			});
		});
		/* eslint-enable */
	}

	// abstract method to be overwritten in subclass
	_connectBroker() {
		return Promise.reject(new Error('No implementation of abstract method _connectBroker() in subclass.'));
	}

	_isResponse(topic, message) {
		if (topic === '$CONTROL/dynamic-security/v1/response'
			|| topic === '$CONTROL/stream-processing/v1/response'
			|| topic === '$CONTROL/cedalo/ha/v1/response'
		) {
			return true;
		}
		try {
			const parsedMessage = JSON.parse(message);
			if (parsedMessage.result || parsedMessage.data) {
				return true;
			}
		} catch (error) {
			return false;
		}
	}

	_handleBrokerMessage(topic, message) {
		if (topic.startsWith('$CONTROL')) {
			const parsedMessage = JSON.parse(message);
			const isResponse = this._isResponse(topic, message);
			if (isResponse) {
				parsedMessage.responses.forEach((response) => {
					const request = deletePendingRequest(response.correlationData, this._requests);
					if (request) {
						this.logger.debug('Got response from Mosquitto', response);
						// if (response.error) {
						// 	request.reject(response);
						// }
						delete response.correlationData;
						request.resolve(response);
					}
				});
			} else if (parsedMessage.type === 'event') {
				this._handleEvent(parsedMessage.event);
			}
		}
	}

	_handleEvent(event) {
		const listeners = this._eventListeners.get(event.type);
		if (listeners) {
			listeners.forEach((listener) => listener(event));
		}
	}

	get connected() {
		return this._isConnected;
	}
};

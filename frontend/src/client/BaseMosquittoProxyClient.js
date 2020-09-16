const uuid = require('uuid/v1');

const createError = (code, message) => ({
	code,
	message
});

// TODO: merge with method deletePendingRequest()
const deletePendingRequest = (requestId, requests) => {
	const request = requests.get(requestId);
	if (request) {
		clearTimeout(request.timeoutId);
		requests.delete(requestId);
	}
	return request;
};
const timeoutHandler = (requestId, requests) => {
	const { reject } = deletePendingRequest(requestId, requests);
	reject({
		message: 'BaseMosquittoProxyClient: Timeout',
		requestId
	});
};

const createID = () =>  uuid();

export default class BaseMosquittoProxyClient {
	constructor({ name, logger, defaultListener } = {}) {
		this.name = name || 'Default Base Mosquitto Proxy Client';
		this._logger = logger || {
			log() {},
			info() {},
			warn() {},
			debug() {},
			error() {}
		};
		this._eventHandler = (event) => this.logger.info(event);
		this._closeHandler = () => this.logger.info('Close Mosquitto Proxy Client');
		this._eventListeners = new Map();
		this._isConnected = false;
		this._requests = new Map();
		// TODO: make timeout configurable
		// request timeout in ms:
		this._timeout = 15000;
	}

	// eslint-disable-next-line consistent-return
	async connect({ socketEndpointURL } = {}) {
		if (this._isConnected || this._isConnecting) {
			return Promise.resolve({});
		}
		this._isConnecting = true;
		// TODO: handle default values
		this._socketEndpointURL = socketEndpointURL || this._socketEndpointURL;
		try {
			const ws = await this._connectSocketServer(`${this._socketEndpointURL}?authToken=${this._token}`);
			this._ws = ws;
			this._isConnected = true;
		} catch (error) {
			this._isConnected = false;
			this.logger.error(error);
		}
	}

	async reconnect() {
		const socketEndpointURL = this._socketEndpointURL;
		this.connect({ socketEndpointURL });
	}

	async disconnect() {
		if(this._ws) {
			this._ws.close();
		}
		return Promise.resolve();
	}

	async resetConnection() {
		await this.disconnect();
		return this.reconnect();
	}

	get logger() {
		return this._logger;
	}

	/**
	 * ******************************************************************************************
	 * Methods for handling multiple broker connections
	 * ******************************************************************************************
	 */

	async connectToBroker(brokerName) {
		return this.sendRequest({
			id: createID(),
			type: 'request',
			request: 'connectToBroker',
			brokerName
		});
	}

	async disconnectFromBroker(brokerName) {
		return this.sendRequest({
			id: createID(),
			type: 'request',
			request: 'disconnectFromBroker',
			brokerName
		});
	}

	async getBrokerConnections() {
		const response = await this.sendRequest({
			id: createID(),
			type: 'request',
			request: 'getBrokerConnections'
		});
		return response.response;
	}

	async getBrokerConfigurations() {
		const response = await this.sendRequest({
			id: createID(),
			type: 'request',
			request: 'getBrokerConfigurations'
		});
		return response.response;
	}

	/**
	 * ******************************************************************************************
	 * Methods for security policy management
	 * ******************************************************************************************
	 */

	async addPolicy(policyName, policy, users, groups) {
		return this.sendCommand({
			command: 'addPolicy',
			policyName,
			policy,
			users,
			groups
		});
	}

	async deletePolicy(policyName) {
		return this.sendCommand({
			command: 'deletePolicy',
			policyName
		});
	}

	async replacePolicy(policyName, policy, users, groups) {
		return this.sendCommand({
			command: 'replacePolicy',
			policyName,
			policy,
			users,
			groups
		});
	}

	async getPolicy(policyName) {
		return this.sendCommand({
			command: 'getPolicy',
			policyName
		});
	}

	// TODO: should include user as parameter
	async setUserPolicy(policyName) {
		return this.sendCommand({
			command: 'setUserPolicy',
			policyName
		});
	}

	// TODO: should include user group as parameter
	async setGroupPolicy(policyName) {
		return this.sendCommand({
			command: 'setGroupPolicy',
			policyName
		});
	}

	async listPolicies() {
		return this.sendCommand({
			command: 'listPolicies'
		});
	}

	async setUserDefaultPolicy(policyName) {
		return this.sendCommand({
			command: 'setUserDefaultPolicy',
			policyName
		});
	}

	async setGroupDefaultPolicy(policyName) {
		return this.sendCommand({
			command: 'setGroupDefaultPolicy',
			policyName
		});
	}

	async addPolicyFeature(policyName, featureName) {
		return this.sendCommand({
			command: 'addPolicyFeature',
			policyName,
			featureName
		});
	}

	async removePolicyFeature(policyName, featureName) {
		return this.sendCommand({
			command: 'removePolicyFeature',
			policyName,
			featureName
		});
	}

	async addTopicAccessControlPublishWrite(policyName, topicFilter, maxQos = 2, allowRetain = true, maxPayloadSize = 1000, allow = false) {
		return this.sendCommand({
			command: 'addTopicAccessControl',
			type: 'publish-write',
			policyName,
			topicFilter,
			maxQos,
			allowRetain,
			maxPayloadSize,
			allow
		});
	}

	async addTopicAccessControlPublishRead(policyName, topicFilter) {
		return this.sendCommand({
			command: 'addTopicAccessControl',
			type: 'publish-read',
			policyName,
			topicFilter
		});
	}

	async addTopicAccessControlSubscribe(policyName, topicFilter, maxQos = 2, allow = true) {
		return this.sendCommand({
			command: 'addTopicAccessControl',
			type: 'subscribe-',
			policyName,
			topicFilter,
			maxQos,
			allow
		});
	}

	async addTopicAccessControlSubscribeFixed(policyName, topicFilter, maxQos = 2, allow = true) {
		return this.sendCommand({
			command: 'addTopicAccessControl',
			type: 'subscribe-fixed',
			policyName,
			topicFilter,
			maxQos,
			allow
		});
	}

	/**
	 * ******************************************************************************************
	 * Methods for user and user group management
	 * ******************************************************************************************
	 */

	async addUser(username, password, clientid, policyName) {
		return this.sendCommand({
			command: 'addUser',
			username,
			password,
			clientid,
			policyName
		});
	}

	async deleteUser(username) {
		return this.sendCommand({
			command: 'deleteUser',
			username
		});
	}

	async setUserPassword(username, password) {
		return this.sendCommand({
			command: 'setUserPassword',
			username,
			password
		});
	}

	async addGroup(groupname, policyName) {
		return this.sendCommand({
			command: 'addGroup',
			groupname,
			policyName
		});
	}

	async addUserToGroup(username, group) {
		return this.sendCommand({
			command: 'addUserToGroup',
			username,
			group
		});
	}

	async removeUserFromGroup(username, group) {
		return this.sendCommand({
			command: 'removeUserFromGroup',
			username,
			group
		});
	}

	async listUsers(verbose = false) {
		return this.sendCommand({
			command: 'listUsers',
			verbose
		});
	}

	async listGroups(verbose = false) {
		return this.sendCommand({
			command: 'listGroups',
			verbose
		});
	}

	async listGroupUsers(group) {
		return this.sendCommand({
			command: 'listGroupUsers',
			group
		});
	}

	async kickClient(username, clientid) {
		return this.sendCommand({
			command: 'kickClient',
			username,
			clientid
		});
	}

	/**
	 * ******************************************************************************************
	 * Additional methods not specified in the Mosquitto API
	 * ******************************************************************************************
	 */

	async getUser(username) {
		const users = await this.listUsers();
		return users.find((user) => user.username === username);
	}

	async getUserCount() {
		const users = await this.listUsers();
		return users.length;
	}

	async deleteAllUsers() {
		const users = await this.listUsers();
		for (const user of users) {
			await this.deleteUser(user.username);
		}
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

	async sendCommand(command, id = createID()) {
		return this.sendRequest({
			id,
			type: 'command',
			command
		});
	}

	async sendRequest(request, timeout = this._timeout) {
		/* eslint-disable */
		this.logger.debug('Sending request to Mosquitto proxy', request);
		return new Promise((resolve, reject) => {
			const timeoutId = setTimeout(
				() => timeoutHandler(request.id, this._requests),
				timeout
			);
			this._requests.set(request.id, {
				resolve,
				reject,
				timeoutId,
				request
			});
			return new Promise((resolve /* , reject */) => {
				this._ws.send(JSON.stringify(request));
				resolve();
			}).catch((error) => {
				this.logger.error(
					'Sending request to Mosquitto proxy',
					request
				);
				this.logger.error(
					`Error while communicating with Mosquitto proxy while executing request '${
						request
					}'`,
					error
				);
				throw error;
			});
		});
		/* eslint-enable */
	}

	// abstract method to be overwritten in subclass
	_connectSocketServer() {
		return Promise.reject(
			new Error(
				'No implementation of abstract method _connectSocketServer() in subclass.'
			)
		);
	}

	_handleSocketMessage(message) {
		const parsedMessage = JSON.parse(message);
		if (parsedMessage.type === 'response') {
			const request = deletePendingRequest(parsedMessage.requestId, this._requests);
			if (request) {
				if (parsedMessage.type === 'response') {
					this.logger.debug('Got response from Mosquitto proxy', parsedMessage);
					request.resolve(parsedMessage);
				} else {
					request.reject(parsedMessage);
				}
			}
		} else if (parsedMessage.type === 'event') {
			this._handleEvent(parsedMessage.event);
		}
	}

	_handleEvent(event) {
		const listeners = this._eventListeners.get(event.type);
		if (listeners) {
			listeners.forEach((listener) => listener(event));
		}
	}

	_handleOpenedSocketConnection() {
		this.logger.info(`Client '${this.name}' connected`);
		return Promise.resolve(this);
	}

	_handleSocketClose(event) {
		this.logger.info('Websocket closed');
		this.closeHandler(event);
		this._handleEvent({
			type: 'disconnected'
		});
	}

	_handleSocketError(event) {
		this.logger.info('Websocket error', event);
	}
};

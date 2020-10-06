const uuid = require('uuid/v1');

const createError = (code, message) => ({
	code,
	message
});

const API_DYNAMIC_SECURITY = 'dynamic-security';

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
		this._timeout = 3000;
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
	 * Methods for role management
	 * ******************************************************************************************
	 */

	async createRole(roleName, role, clients, groups) {
		return this.sendCommand({
			command: 'createRole',
			roleName,
			role,
			clients,
			groups
		}, API_DYNAMIC_SECURITY);
	}

	async deleteRole(roleName) {
		return this.sendCommand({
			command: 'deleteRole',
			roleName
		}, API_DYNAMIC_SECURITY);
	}

	async getRole(roleName) {
		return this.sendCommand({
			command: 'getRole',
			roleName
		}, API_DYNAMIC_SECURITY);
	}

	async listRoles() {
		return this.sendCommand({
			command: 'listRoles'
		}, API_DYNAMIC_SECURITY);
	}

	// TODO: check deprecated methods

	// // TODO: should include client as parameter
	// async setClientPolicy(policyName) {
	// 	return this.sendCommand({
	// 		command: 'setClientPolicy',
	// 		policyName
	// 	}, API_DYNAMIC_SECURITY);
	// }

	// // TODO: should include client group as parameter
	// async setGroupPolicy(policyName) {
	// 	return this.sendCommand({
	// 		command: 'setGroupPolicy',
	// 		policyName
	// 	}, API_DYNAMIC_SECURITY);
	// }

	// async setClientDefaultPolicy(policyName) {
	// 	return this.sendCommand({
	// 		command: 'setClientDefaultPolicy',
	// 		policyName
	// 	}, API_DYNAMIC_SECURITY);
	// }

	// async setGroupDefaultPolicy(policyName) {
	// 	return this.sendCommand({
	// 		command: 'setGroupDefaultPolicy',
	// 		policyName
	// 	}, API_DYNAMIC_SECURITY);
	// }

	// async addPolicyFeature(policyName, featureName) {
	// 	return this.sendCommand({
	// 		command: 'addPolicyFeature',
	// 		policyName,
	// 		featureName
	// 	}, API_DYNAMIC_SECURITY);
	// }

	// async removePolicyFeature(policyName, featureName) {
	// 	return this.sendCommand({
	// 		command: 'removePolicyFeature',
	// 		policyName,
	// 		featureName
	// 	}, API_DYNAMIC_SECURITY);
	// }

	// async addTopicAccessControlPublishWrite(policyName, topicFilter, maxQos = 2, allowRetain = true, maxPayloadSize = 1000, allow = false) {
	// 	return this.sendCommand({
	// 		command: 'addTopicAccessControl',
	// 		type: 'publish-write',
	// 		policyName,
	// 		topicFilter,
	// 		maxQos,
	// 		allowRetain,
	// 		maxPayloadSize,
	// 		allow
	// 	}, API_DYNAMIC_SECURITY);
	// }

	// async addTopicAccessControlPublishRead(policyName, topicFilter) {
	// 	return this.sendCommand({
	// 		command: 'addTopicAccessControl',
	// 		type: 'publish-read',
	// 		policyName,
	// 		topicFilter
	// 	}, API_DYNAMIC_SECURITY);
	// }

	// async addTopicAccessControlSubscribe(policyName, topicFilter, maxQos = 2, allow = true) {
	// 	return this.sendCommand({
	// 		command: 'addTopicAccessControl',
	// 		type: 'subscribe-',
	// 		policyName,
	// 		topicFilter,
	// 		maxQos,
	// 		allow
	// 	}, API_DYNAMIC_SECURITY);
	// }

	// async addTopicAccessControlSubscribeFixed(policyName, topicFilter, maxQos = 2, allow = true) {
	// 	return this.sendCommand({
	// 		command: 'addTopicAccessControl',
	// 		type: 'subscribe-fixed',
	// 		policyName,
	// 		topicFilter,
	// 		maxQos,
	// 		allow
	// 	}, API_DYNAMIC_SECURITY);
	// }

	/**
	 * ******************************************************************************************
	 * Methods for client and client group management
	 * ******************************************************************************************
	 */

	async createClient(username, password, clientid, roleName = "", textName, textDescription) {
		return this.sendCommand({
			command: 'createClient',
			username,
			password,
			clientid,
			roleName,
			textName,
			textDescription
		}, API_DYNAMIC_SECURITY);
	}

	async deleteClient(username) {
		return this.sendCommand({
			command: 'deleteClient',
			username
		}, API_DYNAMIC_SECURITY);
	}

	async addClientRole(username, roleName) {
		return this.sendCommand({
			command: 'addClientRole',
			username,
			roleName
		}, API_DYNAMIC_SECURITY);
	}

	async removeClientRole(username, roleName) {
		return this.sendCommand({
			command: 'removeClientRole',
			username,
			roleName
		}, API_DYNAMIC_SECURITY);
	}

	async setClientPassword(username, password) {
		return this.sendCommand({
			command: 'setClientPassword',
			username,
			password
		}, API_DYNAMIC_SECURITY);
	}

	async createGroup(groupName, roleName = "", textName, textDescription) {
		return this.sendCommand({
			command: 'createGroup',
			groupName,
			roleName,
			textName,
			textDescription
		}, API_DYNAMIC_SECURITY);
	}

	async addGroupRole(groupName, roleName) {
		return this.sendCommand({
			command: 'addGroupRole',
			groupName,
			roleName
		}, API_DYNAMIC_SECURITY);
	}

	async removeGroupRole(groupName, roleName) {
		return this.sendCommand({
			command: 'removeGroupRole',
			groupName,
			roleName
		}, API_DYNAMIC_SECURITY);
	}

	async addClientToGroup(username, groupName) {
		return this.sendCommand({
			command: 'addClientToGroup',
			username,
			groupName
		}, API_DYNAMIC_SECURITY);
	}

	async removeClientFromGroup(username, groupName) {
		return this.sendCommand({
			command: 'removeClientFromGroup',
			username,
			groupName
		}, API_DYNAMIC_SECURITY);
	}

	async getClient(username) {
		// const clients = await this.listClients();
		// return clients.find((client) => client.username === username);
		const data = await this.sendCommand({
			command: 'getClient',
			username
		}, API_DYNAMIC_SECURITY);
		return data.client;
	}

	async listClients(verbose = true) {
		const data = await this.sendCommand({
			command: 'listClients',
			verbose
		}, API_DYNAMIC_SECURITY);
		return data.clients;
	}

	async getGroup(groupname) {
		// const groups = await this.listGroups();
		// return groups.find((group) => group.groupname === groupname);
		const data = await this.sendCommand({
			command: 'getGroup',
			groupname
		}, API_DYNAMIC_SECURITY);
		return data.group;
	}

	async listGroups(verbose = true) {
		const data = await this.sendCommand({
			command: 'listGroups',
			verbose
		}, API_DYNAMIC_SECURITY);
		return data.groups;
	}

	async listGroupClients(group) {
		return this.sendCommand({
			command: 'listGroupClients',
			group
		}, API_DYNAMIC_SECURITY);
	}

	async kickClient(username, clientid) {
		return this.sendCommand({
			command: 'kickClient',
			username,
			clientid
		}, API_DYNAMIC_SECURITY);
	}

	/**
	 * ******************************************************************************************
	 * Methods for role management
	 * ******************************************************************************************
	 */

	async createRole(roleName, acls) {
		return this.sendCommand({
			command: 'createRole',
			roleName,
			acls,
		}, API_DYNAMIC_SECURITY);
	}

	async deleteRole(roleName) {
		return this.sendCommand({
			command: 'deleteRole',
			roleName,
		}, API_DYNAMIC_SECURITY);
	}

	async getRole(roleName) {
		return this.sendCommand({
			command: 'getRole',
			roleName,
		}, API_DYNAMIC_SECURITY);
	}

	async listRoles(verbose = true) {
			command: 'listRoles',
			verbose,
		}, API_DYNAMIC_SECURITY);
	}

	/**
	 * 
	 * @param {*} roleName 
	 * @param {*} aclType   Can be one of publishSend, publishReceive, subscribeLiteral, subscribePattern, unsubscribeLiteral, unsubscribePattern.
	 * @param {*} priority 
	 * @param {*} topic 
	 * @param {*} allow 
	 */
	async addACLToRole(roleName, aclType, priority, topic, allow) {
		return this.sendCommand({
			command: 'addACLToRole',
			roleName,
			aclType,
			priority,
			topic,
			allow,
		}, API_DYNAMIC_SECURITY);
	}
	
	async removeACLFromRole(roleName, acl) {
		return this.sendCommand({
			command: 'removeACLFromRole',
			roleName,
			acl,
		}, API_DYNAMIC_SECURITY);
	}

	/**
	 * ******************************************************************************************
	 * Additional methods not specified in the Mosquitto API
	 * ******************************************************************************************
	 */

	async updateClientGroups(client, groupNames = []) {
		if (!groupNames) {
			groupNames = [];
		}
		const clientGroupNames = client.groups.map(group => group.groupName);
		const groupsToRemove = clientGroupNames.filter(groupName => !groupNames.includes(groupName));
		const groupsToAdd = groupNames.filter(groupName => !clientGroupNames.includes(groupName));
		for (const groupToRemove of groupsToRemove) {
			await this.removeClientFromGroup(client.username, groupToRemove);
		}
		for (const groupToAdd of groupsToAdd) {
		  	await this.addClientToGroup(client.username, groupToAdd);
	  }
	}

	async updateClientRoles(client, roleNames = []) {
		if (!roleNames) {
			roleNames = [];
		}
		if (client.roles) {
			const clientRoleNames = client.roles.map(role => role.roleName);
			const rolesToRemove = clientRoleNames.filter(roleName => !roleNames.includes(roleName));
			const rolesToAdd = roleNames.filter(roleName => !clientRoleNames.includes(roleName));
			for (const roleToRemove of rolesToRemove) {
				await this.removeClientRole(client.username, roleToRemove);
			}
			for (const roleToAdd of rolesToAdd) {
				  await this.addClientRole(client.username, roleToAdd);
		  }
		}
	}

	async updateGroupClients(group, usernames = []) {
		if (!usernames) {
			usernames = [];
		}
		const groupusernames = group.clients.map(client => client.username);
		const clientsToRemove = groupusernames.filter(username => !usernames.includes(username));
		const clientsToAdd = usernames.filter(username => !groupusernames.includes(username));
		for (const clientToRemove of clientsToRemove) {
			await this.removeClientFromGroup(clientToRemove, group.groupName);
		}
		for (const clientToAdd of clientsToAdd) {
		  	await this.addClientToGroup(clientToAdd, group.groupName);
	  }
	}

	async updateGroupRoles(group, roleNames = []) {
		if (!roleNames) {
			roleNames = [];
		}
		if (group.roles) {
			const groupRoleNames = group.roles.map(role => role.roleName);
			const rolesToRemove = groupRoleNames.filter(roleName => !roleNames.includes(roleName));
			const rolesToAdd = roleNames.filter(roleName => !groupRoleNames.includes(roleName));
			for (const roleToRemove of rolesToRemove) {
				await this.removeGroupRole(group.groupName, roleToRemove);
			}
			for (const roleToAdd of rolesToAdd) {
				  await this.addGroupRole(group.groupName, roleToAdd);
		  }
		}
	}

	async getClientCount() {
		const clients = await this.listClients();
		return clients.length;
	}

	async getGroupCount() {
		const groups = await this.listGroups();
		return groups.length;
	}

	async addClientToGroups(username, groups) {
		if (groups) {
			for (const group of groups) {
				await this.addClientToGroup(username, group);
			}
		}
	}

	async deleteGroup(groupname) {
		return this.sendCommand({
			command: 'deleteGroup',
			groupname
		}, API_DYNAMIC_SECURITY);
	}

	async deleteAllClients() {
		const clients = await this.listClients();
		for (const client of clients) {
			await this.deleteClient(client.username);
		}
	}

	async deleteAllGroups() {
		const groups = await this.listGroups();
		for (const group of groups) {
			await this.deleteGroup(group.groupname);
		}
	}

	async deleteAll() {
		await this.deleteAllClients();
		await this.deleteAllGroups();
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

	async sendCommand(command, api, id = createID()) {
		const response = await this.sendRequest({
			id,
			api,
			type: 'command',
			command
		});
		return response.data;
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

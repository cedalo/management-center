const unloadPluginAction = {
	type: 'plugin/unload',
	fn: ({ user, security, pluginManager }, { pluginId }) => {
		if (!security.acl.isConnectionAuthorized(user, security.acl.atLeastAdmin)) {
			throw new NotAuthorizedError();
		}
		const response = pluginManager.unloadPlugin(pluginId);
		return response;
	}
};

const loadPluginAction = {
	type: 'plugin/load',
	fn: ({ user, security, pluginManager }, { pluginId }) => {
		if (!security.acl.isConnectionAuthorized(user, security.acl.atLeastAdmin)) {
			throw new NotAuthorizedError();
		}
		const response = pluginManager.loadPlugin(pluginId);
		return response;
	}
};
const setPluginStatusAtNextStartupAction = {
	type: 'plugin/setStatusNextStartup',
	fn: ({ user, security, pluginManager }, { pluginId, nextStatus }) => {
		if (!security.acl.isConnectionAuthorized(user, security.acl.atLeastAdmin)) {
			throw new NotAuthorizedError();
		}
		const response = pluginManager.setPluginStatusAtNextStartup(pluginId, !!nextStatus);
		return response;
	}
};

const testConnectionAction = {
	type: 'connection/test',
	fn: async ({ user, security, configManager }, { connection }) => {
		if (!security.acl.noRestrictedRoles(user)) {
			throw new NotAuthorizedError();
		}
		const testClient = new NodeMosquittoClient({
			/* logger: console */
		});

		const filteredConnection = configManager.filterConnectionObject(connection);
		filteredConnection.reconnectPeriod = 0; // add reconnectPeriod to MQTTjsClient so that it does not try to constantly reconnect on unsuccessful connection

		// try {
		await testClient.connect({
			mqttEndpointURL: filteredConnection.url,
			options: createOptions(filteredConnection)
		});
		await testClient.disconnect();
		// } catch(error) {
		// 	console.error(error);

		// 	connection.status = {
		// 		connected: false,
		// 		timestamp: Date.now(),
		// 		error: error
		// 	};
		// 	configManager.updateConnection(connection.id, connection);
		// 	sendConnectionsUpdate(testClient);

		// 	throw error;
		// }

		return {
			connected: true
		};
	}
};
const createConnectionAction = {
	type: 'connection/create',
	fn: async ({ user, security, configManager, licenseContainer }, { connection }) => {
		if (!security.acl.isConnectionAuthorized(user, security.acl.atLeastAdmin, null, null, 'createConnection')) {
			throw new NotAuthorizedError();
		}

		try {
			if (configManager.connections.length < licenseContainer.license.maxBrokerConnections) {
				configManager.createConnection(connection);
			} else {
				throw new Error('Maximum number of connections reached.');
			}
		} catch (error) {
			// TODO: handle error because Management Center crashes
			console.error(error);
			throw error;
		}
		return configManager.connections;
	}
};
const modifyConnectionAction = {
	type: 'connection/modify',
	fn: async ({ user, security, configManager }, { oldConnectionId, connection }) => {
		if (!security.acl.isConnectionAuthorized(user, security.acl.atLeastAdmin, null, oldConnectionId)) {
			throw new NotAuthorizedError();
		}
		configManager.updateConnection(oldConnectionId, connection);

		return configManager.connections;
	}
};
const deleteConnectionAction = {
	type: 'connection/delete',
	fn: async ({ user, security, configManager }, { id }) => {
		try {
			if (!security.acl.isConnectionAuthorized(user, security.acl.atLeastAdmin, null, id)) {
				throw new NotAuthorizedError();
			}
			const connection = configManager.getConnection(id);
			if (connection.cluster) {
				throw new Error(
					`Could not delete "${id}" because it's part of the cluster "${connection.cluster}". Delete cluster first`
				);
			}
			configManager.deleteConnection(id);
			return configManager.connections;
		} catch (error) {
			console.log('error when deleting:', error);
			throw error;
		}
	}
};

module.exports = {
	unloadPluginAction,
	loadPluginAction,
	setPluginStatusAtNextStartupAction,
	testConnectionAction,
	createConnectionAction,
	modifyConnectionAction,
	deleteConnectionAction
};

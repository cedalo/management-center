const { AuthError } = require('../../Errors');
const NOT_AUTHORIZED_ERROR_MESSAGE = `You don't have enough user rights to perform this operation`;

const createActions = (plugin) => ({
	connectServerToBrokerAction: {
		type: 'connect-disconnect/connectToBroker',
		isModifying: true,
		fn: async (context, { connectionId }) => {
			const { user, security, configManager } = context;
			if (security.acl.isConnectionAuthorized(user, security.acl.atLeastAdmin, null, connectionId)) {
				const connection = configManager.getConnection(connectionId);
				await context.handleConnectServerToBroker(connection, user);
				if (connection.status?.error) {
					throw new Error(connection.status?.error);
				} else {
					return configManager.connections;
				}
			} else {
				throw AuthError.notAllowed(NOT_AUTHORIZED_ERROR_MESSAGE);
			}
		}
	},
	disconnectServerFromBroker: {
		type: 'connect-disconnect/disconnectFromBroker',
		isModifying: true,
		fn: async (context, { connectionId }) => {
			const { user, security, configManager } = context;
			if (security.acl.isConnectionAuthorized(user, security.acl.atLeastAdmin, null, connectionId)) {
				try {
					const connection = configManager.getConnection(connectionId);
					const isNormalDisconnect = true;
					await context.handleDisconnectServerFromBroker(connection, isNormalDisconnect);
				} catch (error) {
					throw error;
				}
				return configManager.connections;
			} else {
				throw AuthError.notAllowed(NOT_AUTHORIZED_ERROR_MESSAGE);
			}
		}
	}
});

module.exports = {
	createActions
};

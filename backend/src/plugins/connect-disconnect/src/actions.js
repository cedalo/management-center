const { AuthError } = require('../../Errors');
const NOT_AUTHORIZED_ERROR_MESSAGE = `You don't have enough user rights to perform this operation`;

const createActions = (plugin) => ({
	connectServerToBrokerAction: {
		type: 'connect-disconnect/connectToBroker',
		isModifying: true,
		fn: async (context, { id }) => {
			const { user, security, configManager } = context;
			if (security.acl.isConnectionAuthorized(user, security.acl.atLeastAdmin, null, id)) {
				const connection = configManager.getConnection(id);
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
		fn: async (context, { id }) => {
			const { user, security, configManager } = context;
			if (security.acl.isConnectionAuthorized(user, security.acl.atLeastAdmin, null, id)) {
				try {
					const connection = configManager.getConnection(id);
					await context.handleDisconnectServerFromBroker(connection);
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

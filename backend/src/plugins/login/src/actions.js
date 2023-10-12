const { randomUUID } = require('crypto');

const USERNAME = process.env.CEDALO_MC_USERNAME || 'cedalo';
const PASSWORD = process.env.CEDALO_MC_PASSWORD || 'secret';

const addSessionId = (user) => user && { ...user, sessionId: randomUUID() };

const createActions = (plugin) => ({
	loginAction: {
		type: 'user/login',
		isModifying: true,
		metainfo: { source: plugin.featureId, operation: 'login', operationType: 'update' },
		fn: async (context, { username, password }) => {
			if (username === USERNAME && password === PASSWORD) {
				return addSessionId({
					username,
					roles: ['admin']
				});
			}
			const valid =
				(username === USERNAME && password === PASSWORD) ||
				(await context.security?.usersManager?.checkUser(username, password));
			if (!valid) {
				throw new Error('Invalid credentials');
			}
			if (!context.security.usersManagerEnabled) {
				throw new Error('UserManagement disabled');
			}
			return addSessionId(context.security.usersManager.getUser(username));
		},
		filter: ({ password: _, ...toPublish }) => toPublish
	},
	logoutAction: {
		// Dummy Action to receive a logout event
		type: 'user/logout',
		isModifying: true,
		metainfo: { source: plugin.featureId, operation: 'logout', operationType: 'update' },
		fn: (context, { username }) => {
			return true;
		}
	}
});
module.exports = { createActions };

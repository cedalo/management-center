const { randomUUID } = require('crypto');

const USERNAME = process.env.CEDALO_MC_USERNAME || 'cedalo';
const PASSWORD = process.env.CEDALO_MC_PASSWORD || 'secret';

const createActions = (plugin) => ({
	loginAction:  {
		type: 'user/login',
		isModifying: true,
		fn: (context, { username, password }) => {
			if (username === USERNAME && password === PASSWORD) {
				return {
					username,
					roles: ['admin'],
					sessionId: randomUUID()
				};
			}
			const valid =
				(username === USERNAME && password === PASSWORD) ||
				context.security?.usersManager?.checkUser(username, password);
			if (!valid) {
				throw new Error('Invalid credentials');
			}
			if (!context.security.usersManagerEnabled) {
				throw new Error('UserManagement disabled');
			}
			return context.security.usersManager.getUser(username);
		},
		filter: ({ password: _, ...toPublish }) => toPublish
	}, 
	logoutAction:  {
		// Dummy Action to receive a logout event
		type: 'user/logout',
		isModifying: true,
		fn: (context, { username }) => {
			return true;
		},
	}, 
})
;

module.exports = { createActions };

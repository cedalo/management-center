const createActions = (plugin) => ({
	getProfileAction: {
		type: 'user-profile/get',
		fn: ({ user: { password: _, ...cleanUser } }) => cleanUser
	}
});

module.exports = {
	createActions
};

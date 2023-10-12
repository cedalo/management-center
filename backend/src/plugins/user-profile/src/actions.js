const createActions = (plugin) => ({
	getProfileAction: {
		type: 'user-profile/get',
		metainfo: { source: plugin.featureId, operation: 'getUserProfile', operationType: 'read' },
		fn: ({ user: { password: _, ...cleanUser } }) => cleanUser
	}
});

module.exports = {
	createActions
};

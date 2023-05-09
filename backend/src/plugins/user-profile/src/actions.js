const createActions = (plugin) => ({
	getProfileAction: {
		type: 'user-profile/get',
		metainfo: { plugin: plugin.featureId, operation: 'getUserProfile', crud: 'read' },
		fn: ({ user: { password: _, ...cleanUser } }) => cleanUser
	}
});

module.exports = {
	createActions
};

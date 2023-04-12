const getBrokerById = (brokerConnections, id) =>
	brokerConnections.find((brokerConnection) => brokerConnection.id === id);

const isAdminClient = (state) => {
    const defClientUsername = state.brokerConnections?.defaultClient?.username;
    // default client or its username not always defined
    return (client) => (defClientUsername ? defClientUsername === client.username : client.username === 'admin');
};

const getAdminRolesFromState = (state) => {
    const isAdmin = isAdminClient(state);
	const clients = state.clients?.clients?.clients || [];
	const adminClient = clients.find(isAdmin);
	return adminClient ? adminClient.roles.map((r) => r.rolename) : [];
};

export { isAdminClient, getAdminRolesFromState, getBrokerById };

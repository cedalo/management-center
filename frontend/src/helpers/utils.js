const getBrokerById = (brokerConnections, id) =>
	brokerConnections.find((brokerConnection) => brokerConnection.id === id);

const getAdminRolesFromState = (state) => {
	const admin = state.brokerConnections?.defaultClient;
	const clients = state.clients?.clients?.clients;
	if (admin && clients) {
		const adminName = admin.username;
		const adminClient = clients.find((c) => c.username === adminName);
		if (adminClient) return adminClient.roles.map((r) => r.rolename);
	}
	return [];
};

export { getAdminRolesFromState, getBrokerById };

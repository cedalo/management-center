const getBrokerById = (brokerConnections, id) =>
    brokerConnections.find((brokerConnection) => brokerConnection.id === id);

const getIsAdminClient = (defaultClient) => {
    const defClientUsername = defaultClient?.username;
    // default client or its username not always defined
    return (client) => (defClientUsername ? defClientUsername === client.username : client.username === 'admin');
};

const getAdminRoles = (defaultClient, clients) => {
    const isAdmin = getIsAdminClient(defaultClient);
    clients = clients || [];
    const adminClient = clients.find(isAdmin);
    return adminClient ? adminClient.roles.map((r) => r.rolename) : [];
};

export { getIsAdminClient, getAdminRoles, getBrokerById };

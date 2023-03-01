const normalize = (host = '') => {
	if (host.startsWith('//')) return host.substring(2);
	if (host.startsWith('/')) return host.substring(1);
	return host;
};
export const getConnectionInfo = (connection) => {
	const { id, name, url = '' } = connection;
	const parts = url.split(':');
	return { id, name, protocol: parts[0], host: normalize(parts[1]), port: parts[2] };
};


const byHost = (all, { host }) => {
	all.add(host);
	return all;
};
export const getUsedConnections = (availableConnections, listeners) => {
	const usedHosts = listeners.reduce(byHost, new Set());
	const connections = availableConnections.map((broker) => getConnectionInfo(broker));
	const usedConnections = connections.filter((conn) => usedHosts.has(conn.host));
	return usedConnections.map(({ id, name }) => ({ id, name }));
};


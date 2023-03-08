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


const byHostAndPort = (all, { host, port }) => {
	all.add(host);
	all.add(`${host}:${port}`);
	return all;
};
const selectByHost = (used) => (conn) => used.has(conn.host);
const selectByHostAndPort = (used) => (conn) => used.has(`${conn.host}:${conn.port}`);

export const getUsedConnections = (availableConnections, listeners) => {
	const usedHosts = listeners.reduce(byHostAndPort, new Set());
	const connections = availableConnections.map((broker) => getConnectionInfo(broker));
	let usedConnections = connections.filter(selectByHostAndPort(usedHosts));
	if (!usedConnections.length) usedConnections = connections.filter(selectByHost(usedHosts));
	return usedConnections.map(({ id, name }) => ({ id, name }));
};

const toObj = (delimiter) => (obj, str) => {
	const [key, value] = str.split(delimiter);
	obj[key] = value;
	return obj;
};
export const parseSubjectInfo = (str) => (str ? str.split('\n').reduce(toObj('='), {}) : {});

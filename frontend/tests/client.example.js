const NodeMosquittoProxyClient = require('../src/client/NodeMosquittoProxyClient');

const MOSQUITTO_PROXY_URL = process.env.MOSQUITTO_PROXY_URL || 'ws://localhost';
const MOSQUITTO_PROXY_PORT = process.env.MOSQUITTO_PROXY_PORT || 8088;

(async () => {
	const client = new NodeMosquittoProxyClient({ /* logger: console */ });
	try {
		await client.connect({ socketEndpointURL: `${MOSQUITTO_PROXY_URL}:${MOSQUITTO_PROXY_PORT}` });
		await client.connectToBroker('Mosquitto 2.0 Mock API');
		console.log('Connected');
		await client.addUser('maxmustermann', 'secret', 'fsdf');
		await client.addUserToGroup('maxmustermann', 'admins');
		await client.addUserToGroup('maxmustermann', 'examples');
		await client.removeUserFromGroup('maxmustermann', 'examples');
		await client.addUser('maxmustermann11', 'secret', '123fdsfdsf4567');
		await client.addUser('maxmustermann12', 'secret', '123fdsfsd4567');
		await client.addUser('maxmustermann13', 'secret', 'fsdfsd');
		await client.addUser('maxmustermann14', 'secret', 'fdsfs');
		await client.setUserPassword('maxmustermann14', 'secretNew');
		await client.deleteUser('maxmustermann11');
		const users = await client.listUsers();
		console.log(users);
		const groups = await client.listGroups();
		console.log(groups);
		// const addGroupResponse = await client.addGroup('default');
		// console.log('added group');
	} catch (error) {
		console.error(error);
	}
})();

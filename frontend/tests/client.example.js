const NodeMosquittoProxyClient = require('../src/client/NodeMosquittoProxyClient');

const MOSQUITTO_PROXY_URL = process.env.MOSQUITTO_PROXY_URL || 'ws://localhost';
const MOSQUITTO_PROXY_PORT = process.env.MOSQUITTO_PROXY_PORT || 8088;

(async () => {
	const client = new NodeMosquittoProxyClient({ /* logger: console */ });
	try {
		await client.connect({ socketEndpointURL: `${MOSQUITTO_PROXY_URL}:${MOSQUITTO_PROXY_PORT}` });
		await client.connectToBroker('Mosquitto 2.0 Mock API');
		await client.addGroup('admins', 'somePolicy');
		await client.addGroup('developers', 'somePolicy');
		await client.addGroup('readers', 'somePolicy');
		await client.addGroup('users', 'somePolicy');
		await client.addUser('user1', 'secret', 'fsdf');
		await client.addUserToGroup('user1', 'admins');
		await client.addUserToGroup('user1', 'developers');
		await client.addUserToGroup('user1', 'readers');
		await client.addUserToGroup('user1', 'users');
		await client.removeUserFromGroup('user1', 'admins');
		await client.addUser('user2', 'secret', '123fdsfdsf4567');
		await client.addUser('user3', 'secret', '123fdsfsd4567');
		await client.addUserToGroup('user3', 'admins');
		await client.addUserToGroup('user3', 'developers');
		await client.addUser('user4', 'secret', 'fsdfsd');
		await client.addUser('user5', 'secret', 'fdsfs');
		await client.addUserToGroup('user5', 'readers');
		await client.addUserToGroup('user5', 'users');
		await client.setUserPassword('user5', 'secretNew');
		await client.deleteUser('user2');
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

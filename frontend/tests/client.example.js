const NodeMosquittoProxyClient = require('../src/client/NodeMosquittoProxyClient');

const MOSQUITTO_PROXY_URL = process.env.MOSQUITTO_PROXY_URL || 'ws://localhost';
const MOSQUITTO_PROXY_PORT = process.env.MOSQUITTO_PROXY_PORT || 8088;

(async () => {
	const client = new NodeMosquittoProxyClient({
		/* logger: console */
	});
	try {
		await client.connect({ socketEndpointURL: `${MOSQUITTO_PROXY_URL}:${MOSQUITTO_PROXY_PORT}` });
		await client.connectToBroker('Mosquitto 2.0 Preview');
		// await client.connectToBroker('Mosquitto 2.0 Mock API');
		console.log('connected');
		const usersBefore = await client.listUsers();
		console.log(usersBefore);
		const groupsBefore = await client.listGroups();
		console.log(groupsBefore);
		// process.exit(0)

		try {
			const response = await client.addUser(
				'streamsheets',
				'secret',
				'streamsheets',
				'',
				'Cedalo Sheets',
				'The best software for integrating things.'
			);
			console.log(response);
			console.log('connected');
		} catch (error) {
			console.log(error);
		}
		await client.addGroup('software', '', 'Software', 'Software connected to Mosquitto.');
		await client.addGroup('sensors', '', 'Sensors', 'Sensors connected to Mosquitto.');
		await client.addGroup('hall1', '', 'Factory hall 1', 'Sensors in factory hall one.');
		await client.addGroup('hall2', '', 'Factory hall 2', 'Sensors in factory hall two.');
		await client.addGroup('hall3', '', 'Factory hall 3', 'Sensors in factory hall three.');

		await client.addUser('node-red', 'secret', 'nodered', '', 'Node-RED', 'A software for integrating things.');
		await client.addUser('n8n', 'secret', 'n8n', '', 'n8n.io', 'A software for integrating things.');
		await client.addUser('temp-1', 'secret', 'sensor_1', '', ' Temperature Sensor', 'A sensor for temperature.');
		await client.addUser('hum-1', 'secret', 'sensor_2', '', 'Humidity Sensor', 'A sensor for humidity.');
		await client.addUser(
			'temp-2',
			'secret',
			'sensor_3',
			'',
			'Temperature Sensor',
			'Another sensor for temperature.'
		);

		await client.addUserToGroup('streamsheets', 'software');
		await client.addUserToGroup('node-red', 'software');
		await client.addUserToGroup('n8n', 'software');

		await client.addUserToGroup('temp-1', 'sensors');
		await client.addUserToGroup('temp-1', 'hall1');
		await client.addUserToGroup('hum-1', 'sensors');
		await client.addUserToGroup('hum-1', 'hall2');
		await client.addUserToGroup('temp-2', 'sensors');
		await client.addUserToGroup('temp-2', 'hall3');

		// await client.deleteUserFromGroup('user1', 'sensors');
		// await client.setUserPassword('user5', 'secretNew');
		// await client.deleteUser('user2');
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

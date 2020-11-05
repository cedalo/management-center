const NodeMosquittoClient = require('../src/client/NodeMosquittoClient');

const MOSQUITTO_URL = process.env.MOSQUITTO_URL || 'mqtt://localhost';
const MOSQUITTO_PORT = process.env.MOSQUITTO_PORT || 1888;

(async () => {
	const client = new NodeMosquittoClient({
		/* logger: console */
	});
	try {
		await client.connect({
			mqttEndpointURL: `${MOSQUITTO_URL}:${MOSQUITTO_PORT}`
		});
		const feature = 'user-management';
		const commandMessage = {
			command: 'createUser',
			username: 'user_one',
			password: 'password',
			clientid: 'cid',
			rolename: '',
			groups: [
				{
					name: 'admins',
					priority: 0
				}
			]
		};
		const result = await client.sendCommandMessage(feature, commandMessage);
		console.log(result);

		const commandMessage2 = {
			command: 'listUsers'
		};
		const users = await client.sendCommandMessage(feature, commandMessage2);
		console.log(JSON.stringify(users, null, 2));
	} catch (error) {
		console.error(error);
	}
})();

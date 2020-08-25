const NodeMosquittoClient = require('../src/client/NodeMosquittoClient');

const MOSQUITTO_PROXY_URL = process.env.MOSQUITTO_PROXY_URL || 'ws://localhost';
const MOSQUITTO_PROXY_PORT = process.env.MOSQUITTO_PROXY_PORT || 8088;

(async () => {
	const client = new NodeMosquittoClient({ logger: console });
	try {
		await client.connect({ socketEndpointURL: `${MOSQUITTO_PROXY_URL}:${MOSQUITTO_PROXY_PORT}` });
		await client.connectBroker('Mosquitto 1');

		client.on('system_status', (message) => {
			console.log(message);
		});
		client.on('topic_tree', (message) => {
			console.log(message);
		});
		const addUserResponse = await client.addUser('maxmustermann', 'secret', '1234567');
		const assGroupResponse = await client.addGroup('default');

	} catch (error) {
		console.error(error);
	}
})();
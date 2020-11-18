const NodeMosquittoProxyClient = require('../src/client/NodeMosquittoProxyClient');

const MOSQUITTO_PROXY_URL = process.env.MOSQUITTO_PROXY_URL || 'ws://localhost';
const MOSQUITTO_PROXY_PORT = process.env.MOSQUITTO_PROXY_PORT || 8088;

async () => {
	const client1 = new NodeMosquittoProxyClient({
		/* logger: console */
	});
	const client2 = new NodeMosquittoProxyClient({
		/* logger: console */
	});
	const client3 = new NodeMosquittoProxyClient({
		/* logger: console */
	});
	try {
		await client1.connect({ socketEndpointURL: `${MOSQUITTO_PROXY_URL}:${MOSQUITTO_PROXY_PORT}` });
		await client1.connectToBroker('Mosquitto 1');
		// await client.disconnectFromBroker('Mosquitto 1');

		// client1.on('system_status', (message) => {
		// 	console.log(message);
		// });
		// client1.on('topic_tree', (message) => {
		// 	console.log('Client 1');
		// 	console.log(message);
		// });
		const addUserResponse = await client1.addUser('maxmustermann', 'secret', '1234567');
		const addGroupResponse = await client1.addGroup('default');
		const connections = await client1.getBrokerConnections();
		console.log(connections);

		await client2.connect({ socketEndpointURL: `${MOSQUITTO_PROXY_URL}:${MOSQUITTO_PROXY_PORT}` });
		await client2.connectToBroker('Mosquitto 2');
		// client2.on('topic_tree', (message) => {
		// 	console.log('Client 2');
		// 	console.log(message);
		// });

		await client3.connect({ socketEndpointURL: `${MOSQUITTO_PROXY_URL}:${MOSQUITTO_PROXY_PORT}` });
		await client3.connectToBroker('Mosquitto 3');
		// client3.on('topic_tree', (message) => {
		// 	console.log('Client 3');
		// 	console.log(message);
		// });
	} catch (error) {
		console.error(error);
	}
};

(async () => {
	const client = new NodeMosquittoProxyClient({
		/* logger: console */
	});
	try {
		await client.connect({ socketEndpointURL: `${MOSQUITTO_PROXY_URL}:${MOSQUITTO_PROXY_PORT}` });
		await client.connectToBroker('Mosquitto Mock API');
		await client.addUser('maxmustermann', 'secret', '1234567');
		const users = await client.listUsers();
		console.log(users);
		const connections = await client.getBrokerConnections();
	} catch (error) {
		console.error(error);
	}
})();


const NodeMosquittoProxyClient = require('../src/client/NodeMosquittoProxyClient');

const MOSQUITTO_PROXY_URL = process.env.MOSQUITTO_PROXY_URL || 'ws://localhost';
const MOSQUITTO_PROXY_PORT = process.env.MOSQUITTO_PROXY_PORT || 8088;

const client = new NodeMosquittoProxyClient({ /* logger: console */ });
const TEST_BROKER = 'Mosquitto 2.0 Mock API';

beforeAll(async (callback) => {
	await client.connect({ socketEndpointURL: `${MOSQUITTO_PROXY_URL}:${MOSQUITTO_PROXY_PORT}` });
	await client.connectToBroker(TEST_BROKER);
	callback();
});

afterAll(async (callback) => {
	await client.disconnectFromBroker(TEST_BROKER);
	callback();
});
test('addUser()', async (callback) => {
	const initialUsers = await client.getUserCount();
	await client.addUser('maxmustermann', 'secret', 'fsdf');
	const newUsers = await client.getUserCount();
	expect(newUsers).toBe(initialUsers + 1);
	callback();
});

test('deleteUser()', async (callback) => {
	const initialUsers = await client.getUserCount();
	await client.addUser('maxmustermann2', 'secret', 'fsdf');
	const newUsers = await client.getUserCount();
	expect(newUsers).toBe(initialUsers + 1);
	await client.deleteUser('maxmustermann2');
	const updatedUsers = await client.getUserCount();
	expect(updatedUsers).toBe(initialUsers);
	callback();
});

const NodeMosquittoProxyClient = require('../src/client/NodeMosquittoProxyClient');

const MOSQUITTO_PROXY_URL = process.env.MOSQUITTO_PROXY_URL || 'ws://localhost';
const MOSQUITTO_PROXY_PORT = process.env.MOSQUITTO_PROXY_PORT || 8088;

const client = new NodeMosquittoProxyClient({
	/* logger: console */
});
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

beforeEach(async (callback) => {
	await client.deleteAll();
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

test('listUsers()', async (callback) => {
	const users = await client.listUsers();
	for (const user of users) {
		expect(user.username).toBeDefined();
		expect(user.password).toBeDefined();
		expect(user.clientid).toBeDefined();
	}
	callback();
});

test('listUsers()', async (callback) => {
	const users0 = await client.listUsers();
	expect(users0.length).toBe(0);
	await client.addUser('maxmustermann', 'secret', 'fsdf');
	const users1 = await client.listUsers();
	expect(users1.length).toBe(1);
	await client.addUser('maxmustermann2', 'secret', 'fsdf');
	const users2 = await client.listUsers();
	expect(users2.length).toBe(2);
	await client.addUser('maxmustermann3', 'secret', 'fsdf');
	const users3 = await client.listUsers();
	expect(users3.length).toBe(3);
	callback();
});

test('getUser()', async (callback) => {
	const user = {
		username: 'maxmustermann',
		password: 'secret',
		clientid: 'fsdf'
	};
	await client.addUser(user.username, user.password, user.clientid);
	const userLoaded = await client.getUser(user.username);
	expect(userLoaded).toEqual(user);
	callback();
});

test('setUserPassword()', async (callback) => {
	const user = {
		username: 'maxmustermann',
		password: 'secret',
		clientid: 'fsdf'
	};
	const newPassword = 'newPassword';
	await client.addUser(user.username, user.password, user.clientid);
	await client.setUserPassword(user.username, newPassword);
	const userLoaded = await client.getUser(user.username);
	expect(userLoaded.password).toEqual(newPassword);
	callback();
});

test('addGroup()', async (callback) => {
	const initialGroups = await client.getGroupCount();
	await client.addGroup('example', 'examplePolicy');
	const newGroups = await client.getGroupCount();
	expect(newGroups).toBe(initialGroups + 1);
	callback();
});

test('addUserToGroup()', async (callback) => {
	const user = {
		username: 'maxmustermann',
		password: 'secret',
		clientid: 'fsdf'
	};
	const groupname = 'example';
	await client.addUser(user.username, user.password, user.clientid);
	await client.addGroup(groupname, 'examplePolicy');
	const groupUsers = await client.listGroupUsers(groupname);
	expect(groupUsers.length).toBe(0);
	await client.addUserToGroup(user.username, groupname);
	const groupUsers2 = await client.listGroupUsers(groupname);
	expect(groupUsers2.length).toBe(1);
	callback();
});

test('removeUserFromGroup()', async (callback) => {
	const user = {
		username: 'maxmustermann',
		password: 'secret',
		clientid: 'fsdf'
	};
	const groupname = 'example';
	await client.addUser(user.username, user.password, user.clientid);
	await client.addGroup(groupname, 'examplePolicy');
	const groupUsers = await client.listGroupUsers(groupname);
	expect(groupUsers.length).toBe(0);
	await client.addUserToGroup(user.username, groupname);
	const groupUsers2 = await client.listGroupUsers(groupname);
	expect(groupUsers2.length).toBe(1);
	await client.removeUserFromGroup(user.username, groupname);
	const groupUsers3 = await client.listGroupUsers(groupname);
	expect(groupUsers3.length).toBe(0);
	callback();
});

test('listGroups()', async (callback) => {
	const groups0 = await client.listGroups();
	expect(groups0.length).toBe(0);
	await client.addGroup('exampleGroup1', 'examplePolicy');
	const groups1 = await client.listGroups();
	expect(groups1.length).toBe(1);
	await client.addGroup('exampleGroup2', 'examplePolicy');
	const groups2 = await client.listGroups();
	expect(groups2.length).toBe(2);
	await client.addGroup('exampleGroup3', 'examplePolicy');
	const groups3 = await client.listGroups();
	expect(groups3.length).toBe(3);
	callback();
});

test('listGroupUsers()', async (callback) => {
	const user = {
		username: 'maxmustermann',
		password: 'secret',
		clientid: 'fsdf'
	};
	const groupname = 'example';
	await client.addUser(user.username, user.password, user.clientid);
	await client.addGroup(groupname, 'examplePolicy');
	const groupUsers = await client.listGroupUsers(groupname);
	expect(groupUsers.length).toBe(0);
	await client.addUserToGroup(user.username, groupname);
	const groupUsers2 = await client.listGroupUsers(groupname);
	expect(groupUsers2.length).toBe(1);
	callback();
});

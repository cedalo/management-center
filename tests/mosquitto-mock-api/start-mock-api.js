const mqtt = require('mqtt');

const users = new Map();
// users.set('maxmustermann', {
// 	"clientid": "mosquitto-client-mock-api1",
// 	"username": "maxmustermann",
// 	"firstName": "Max",
// 	"lastName": "Mustermann",
// 	"password": "",
// 	"banned": false,
// 	"connectionRate": 0,
// 	"messageRate": 0,
// 	"rolename": "",
// 	"groups": [
// 		{
// 			"name": "admins",
// 			"priority": 0
// 		},
// 		{
// 			"name": "example",
// 			"priority": 0
// 		},
// 	]
// });
// users.set('maxmustermann2', {
// 	"clientid": "mosquitto-client-mock-api2",
// 	"username": "maxmustermann2",
// 	"firstName": "Max",
// 	"lastName": "Mustermann",
// 	"password": "",
// 	"banned": false,
// 	"connectionRate": 0,
// 	"messageRate": 0,
// 	"rolename": "",
// 	"groups": [
// 		{
// 			"name": "admins",
// 			"priority": 0
// 		},
// 		{
// 			"name": "example",
// 			"priority": 0
// 		},
// 		{
// 			"name": "example2",
// 			"priority": 0
// 		},
// 	]
// });
// users.set('maxmustermann3', {
// 	"clientid": "mosquitto-client-mock-api3",
// 	"username": "maxmustermann3",
// 	"firstName": "Max",
// 	"lastName": "Mustermann",
// 	"password": "",
// 	"banned": false,
// 	"connectionRate": 0,
// 	"messageRate": 0,
// 	"rolename": "",
// 	"groups": [
// 		{
// 			"name": "admins",
// 			"priority": 0
// 		},
// 		{
// 			"name": "example",
// 			"priority": 0
// 		},
// 	]
// });

const groups = new Map();

const handleCommand = (message) => {
	// TODO: Mock API only handles one command
	const command = message.commands[0];
	const { correlationData } = command;
	switch (command.command) {
		case 'createUser': {
			const { username, password, clientid } = command;
			if (users.get(username)) {
				return {
					correlationData,
					error: 'User exists'
				};
			}
			const user = {
				username,
				password,
				clientid
			};
			users.set(username, user);
			return {
				correlationData,
				data: user
			};
		}
		case 'deleteUser': {
			const { username } = command;
			users.delete(username);
			return {
				correlationData
			};
		}
		case 'deleteGroup': {
			const { groupname } = command;
			groups.delete(groupname);
			return {
				correlationData
			};
		}
		case 'setUserPassword': {
			const { username, password } = command;
			const user = users.get(username);
			user.password = password;
			return {
				correlationData
			};
		}
		case 'addUserToGroup': {
			const { username, groupname } = command;
			const user = users.get(username);
			user.groups = user.groups || [];
			user.groups.push({
				name: groupname
				// TODO: priority
			});
			const group = groups.get(groupname);
			if (group) {
				group.users = group.users || [];
				if (!group.users.includes(username)) {
					group.users.push(username);
				}
			}
			return {
				correlationData,
				data: user
			};
		}
		case 'removeUserFromGroup': {
			const { username, groupname } = command;
			const user = users.get(username);
			user.groups = user.groups || [];
			const result = user.groups.filter((group) => group.name !== groupname);
			user.groups = result;

			const group = groups.get(groupname);
			if (group) {
				group.users = group.users || [];
				if (group.users.includes(username)) {
					const index = group.users.indexOf(username);
					group.users.splice(index, 1);
				}
			}
			return {
				correlationData
			};
		}
		case 'listUsers': {
			return {
				correlationData,
				data: {
					users: Array.from(users.values())
				}
			};
		}
		case 'listGroups': {
			return {
				correlationData,
				data: {
					groups: Array.from(groups.values())
				}
			};
		}
		case 'createGroup': {
			const { gFroupName, rolename } = command;
			if (groups.get(groupname)) {
				return {
					correlationData,
					error: 'Group exists'
				};
			}
			const group = {
				groupname,
				rolename
			};
			groups.set(groupname, group);
			return {
				correlationData,
				data: group
			};
		}
		case 'listGroupUsers': {
			const { groupname: groupname } = command;
			const group = groups.get(groupname);
			return {
				correlationData,
				data: group.users || []
			};
		}
	}
};

const sendResponse = (response) => {
	mockAPI.publish('$CONTROL/v1/response', JSON.stringify(response));
};

const mockAPI = mqtt.connect('mqtt://localhost:1889');
mockAPI.on('connect', () => {
	mockAPI.subscribe('$CONTROL/#', (error) => {
		if (error) {
			console.error(error);
		}
	});
	mockAPI.publish('$SYS/broker/version', 'Mosquitto 2.0 Mock API', {
		retain: true
	});
	mockAPI.publish('$SYS/broker/clients/total', '15');
	mockAPI.publish('$SYS/broker/clients/active', '5');
	mockAPI.publish('$SYS/broker/clients/connected', '5');
	mockAPI.publish('$SYS/broker/subscriptions/count', '25');
	mockAPI.publish('$SYS/broker/bytes/received', '15000');
	mockAPI.publish('$SYS/broker/bytes/sent', '15000');
	mockAPI.publish('$SYS/broker/publish/messages/received', '15000');
	mockAPI.publish('$SYS/broker/publish/messages/sent', '15000');
});

mockAPI.on('message', (topic, payload) => {
	if (topic.startsWith('$CONTROL')) {
		const parts = topic.split('/');
		const type = parts[1];
		const message = JSON.parse(payload.toString());
		switch (type) {
			case 'user-management': {
				const result = handleCommand(message);
				sendResponse(result);
				break;
			}
			case 'security-policy': {
				const result = handleCommand(message);
				sendResponse(result);
				break;
			}
		}
	}
});

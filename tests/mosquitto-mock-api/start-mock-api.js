const mqtt = require('mqtt');

const users = new Map();

const handleCommand = (message) => {
	// TODO: Mock API only handles one command
	console.log(message);
	const command = message.commands[0];
	const { correlationData } = command;
	switch (command.command) {
		case 'addUser': {
			const { username, password, clientid } = command;
			const user = {
				username,
				password,
				clientid
			};
			users.set(username, user);
			return {
				correlationData,
				user
			}
		}
		case 'listUsers': {
			return {
				correlationData,
				users: Array.from(users.values())
			};
		}
	}
}

const sendResponse = (response) => {
	console.log('send response');
	console.log(response)
	mockAPI.publish("$CONTROL/v1/response", JSON.stringify(response));
}

const mockAPI = mqtt.connect('mqtt://localhost:1889');
mockAPI.on('connect', () => {
	mockAPI.subscribe('$CONTROL/#', (error) => {
		if (error) {
			console.error(error);
		}
	});
	mockAPI.publish('$SYS/broker/version', 'Mosquitto 2.0 Mock API', { retain: true });
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
	console.log(topic);
	if (topic.startsWith('$CONTROL')) {
		const parts = topic.split('/');
		const type = parts[1];
		const message = JSON.parse(payload.toString());
		switch (type) {
			case 'user-management': {
				const result = handleCommand(message);
				console.log(result)
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

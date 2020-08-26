const mqtt = require('mqtt');

const users = [];

const handleCommand = (message) => {
	console.log(message);
	switch (message.command) {
		case 'addUser': {
			const { username, password, clientid } = message;
			users.push({
				username,
				password,
				clientid
			});
			break;
		}
		case 'listUsers': {
			return users;
		}
	}
}

const sendResponse = (response) => {
	console.log('send response');
	console.log(response)
	mockAPI.publish("$CONTROL/v1/response", JSON.stringify(response));
}

const mockAPI = mqtt.connect('mqtt://localhost:1888');
mockAPI.on('connect', () => {
	mockAPI.subscribe('$CONTROL/#', (error) => {
		if (error) {
			console.error(error);
		}
	});
	mockAPI.publish('$SYS/broker/version', 'Mosquitto Mock API (mosca)');
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
		console.log("payload.toString()")
		console.log(payload.toString())
		console.log("payload.toString()")
		const message = JSON.parse(payload.toString());
		switch (type) {
			case 'user-management': {
				const result = handleCommand(message);
				console.log("handling")
				console.log(message)
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

const mqtt = require('mqtt');

const URL = 'localhost:1883';
const USERNAME = 'topictree';
const PASSWORD = 'topictree';

const brokerClient = mqtt.connect(URL, {
	username: USERNAME,
	password: PASSWORD
});

brokerClient.on('connect', () => {
	console.log(`Connected to ${URL}`);
	let counter = 0;
	setInterval(() => {
		counter += 5;
		const sensor = {
			id: 'some sensor',
			value: counter
		}
		brokerClient.publish('sensors/example', JSON.stringify(sensor));
		console.log(JSON.stringify(sensor));
		const sensor2 = {
			id: 'some other sensor',
			value: counter
		}
		brokerClient.publish('sensors/example2', JSON.stringify(sensor2));
		console.log(JSON.stringify(sensor2));
		brokerClient.publish('sensors/nonJSON', `${counter}`);
	}, 1000)
});

const mosca = require('mosca');
const mqtt = require('mqtt');

const settings = {
	port: 1889
};

let mockAPI = null;

const setup = () => {
	console.log('Mosquitto Mock API server is up and running');
	mockAPI = mqtt.connect('mqtt://localhost:1888');
	mockAPI.on('connect', () => {
		console.log('publish');
		mockAPI.publish('$SYS/broker/clients/total', '5');
	});
};

const server = new mosca.Server(settings);

server.on('clientConnected', (client) => {
	console.log('client connected', client.id);
});

server.on('published', (packet, client) => {
	console.log('Published', packet.payload);
});

server.on('ready', setup);

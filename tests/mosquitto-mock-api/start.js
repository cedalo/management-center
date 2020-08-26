const mosca = require('mosca');

const settings = {
  port: 1888
};

const setup = () => {
	console.log('Mosquitto Mock API server is up and running');
  }

const server = new mosca.Server(settings);

server.on('clientConnected', (client) => {
    console.log('client connected', client.id);
});

server.on('published', (packet, client) => {
  console.log('Published', packet.payload);
});

server.on('ready', setup);

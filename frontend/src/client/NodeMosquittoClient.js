const WebSocket = require('ws');
const BaseMosquittoClient = require('./BaseMosquittoClient');

module.exports = class NodeMosquittoClient extends BaseMosquittoClient {
	constructor({ name = 'Node Mosquitto Client', logger } = {}) {
		super({ name, logger: logger });
	}

	_connectSocketServer(url) {
		return new Promise((resolve) => {
			const ws = new WebSocket(url);
			ws.on('open', () => this._handleOpenedSocketConnection().then(() => resolve(ws)));
			ws.on('message', message => this._handleSocketMessage(message));
			ws.on('error', event => this._handleSocketError(event));
			ws.on('close', event => this._handleSocketClose(event));
		});
	}
};

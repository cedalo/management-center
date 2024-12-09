const WebSocket = require('ws');
const BaseMosquittoProxyClient = require('base-mc-classes').BaseMosquittoProxyClient;

module.exports = class NodeMosquittoProxyClient extends BaseMosquittoProxyClient {
    constructor(
        { name = 'Node Mosquitto Proxy Client', logger } = {},
        { socketEndpointURL, httpEndpointURL } = {},
        headers = undefined
    ) {
        super({ name, logger }, { socketEndpointURL, httpEndpointURL }, headers);
    }

    _connectSocketServer(url, sid = undefined) {
        return new Promise((resolve) => {
            const ws = new WebSocket(url, [], sid ? { headers: { Cookie: sid } } : undefined);
            ws.on('open', () => this._handleOpenedSocketConnection().then(() => resolve(ws)));
            ws.on('message', (message) => this._handleSocketMessage(message));
            ws.on('error', (event) => this._handleSocketError(event));
            ws.on('close', (event) => this._handleSocketClose(event));
        });
    }
};

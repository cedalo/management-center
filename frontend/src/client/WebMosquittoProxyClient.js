import BaseMosquittoProxyClient from './BaseMosquittoProxyClient';

export default class WebMosquittoProxyClient extends BaseMosquittoProxyClient {
	constructor({ name = 'Web Mosquitto Proxy Client', defaultListener } = {},
				{ socketEndpointURL, httpEndpointURL } = {}, headers=undefined
	) {
		super({ name, logger: console, defaultListener }, { socketEndpointURL, httpEndpointURL }, headers);
	}

	_connectSocketServer(url) {
		return new Promise((resolve, reject) => {
			const ws = new WebSocket(url);
			ws.onopen = () => {
				this._handleOpenedSocketConnection().then(() => resolve(ws));
			};
			ws.onmessage = (event) => this._handleSocketMessage(event.data);
			ws.onerror = (event) => {
				this._handleSocketError(event);
				reject(event);
			};
			ws.onclose = (event) => this._handleSocketClose(event);
		}).catch((error) => this._handleSocketError(error));
	}
}

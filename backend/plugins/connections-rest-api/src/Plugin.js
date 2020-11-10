const BasePlugin = require('../../base/src/BasePlugin');

module.exports = class Plugin extends BasePlugin {
	constructor() {
		super();
		this._meta = {
			"id": "cedalo_connections_rest_api",
			"name": "Cedalo Connections REST API",
			"version":"1.0",
			"description":"Access the connections via REST API",
			"feature": "REST API"
		}
	}

	init(context) {
		const { app, config } = context;
		app.get('/api/connections', (request, response) => {
			response.json(config.connections);
		});
	}

	load(context) {
	}

	get meta() {
		return this._meta;
	}
}

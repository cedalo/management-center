const BasePlugin = require('../../base/src/BasePlugin');

module.exports = class Plugin extends BasePlugin {
	constructor() {
		super();
		this._meta = {
			"id": "cedalo_system_status_rest_api",
			"name": "Cedalo System Status REST API",
			"version":"1.0",
			"description":"Access the system status via REST API",
			"feature": "REST API"
		}
	}

	init(context) {
		const { app } = context;
		app.get('/api/system/status', (request, response) => {
			response.json(globalSystem);
		});
	}

	load(context) {
	}

	get meta() {
		return this._meta;
	}
}
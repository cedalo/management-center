const BasePlugin = require('../../base/src/BasePlugin');
const meta = require('./meta');

module.exports = class Plugin extends BasePlugin {
	constructor() {
		super();
		this._meta = meta;
	}

	init(context) {
		const { app, globalSystem } = context;
		app.get('/api/system/status', (request, response) => {
			if (this.isLoaded()) {
				response.json(globalSystem);
			} else {
				response.status(404).send('Plugin not loaded');
			}
		});
	}

	get meta() {
		return this._meta;
	}
}
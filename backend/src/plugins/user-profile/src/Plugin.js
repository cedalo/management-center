const BasePlugin = require('../../BasePlugin');
const meta = require('./meta');
const swagger = require('./swagger.js');

module.exports = class Plugin extends BasePlugin {
	constructor() {
		super();
		this._meta = meta;
		this._swagger = swagger;
	}

	init(context) {
		const { router } = context;

		router.get('/api/profile', context.security.isLoggedIn, (request, response) => {
			if (this.isLoaded()) {
				const result = request.user;
				delete result.password;
				response.json(result);
			} else {
				this.sendResponsePluginNotEnabled(response);
			}
		});

	}

	get meta() {
		return this._meta;
	}
}
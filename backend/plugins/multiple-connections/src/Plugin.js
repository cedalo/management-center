const BasePlugin = require('../../base/src/BasePlugin');
const MultipleBrokerManager = require('./MultipleBrokerManager');
const meta = require('./meta');

module.exports = class Plugin extends BasePlugin {
	constructor() {
		super();
		this._meta = meta;
	}

	init(context) {
		
	}

	load(context) {
		const { licenseContainer } = context;
		const maxBrokerConnenctions = licenseContainer.license.maxBrokerConnenctions || 1;
		context.brokerManager = new MultipleBrokerManager(maxBrokerConnenctions);
	}

	get meta() {
		return this._meta;
	}
}
const BasePlugin = require('../../base/src/BasePlugin');
const MultipleBrokerManager = require('./MultipleBrokerManager');

module.exports = class Plugin extends BasePlugin {
	constructor() {
		super();
		this._meta = {
			"id": "cedalo_multiple_connections",
			"name": "Cedalo Multiple Broker Connections",
			"version":"1.0",
			"description":"Define multiple broker connections",
			"feature": "Multiple Broker Connections"
		}
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
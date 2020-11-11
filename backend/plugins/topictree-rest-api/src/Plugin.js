const BasePlugin = require('../../base/src/BasePlugin');
const meta = require('./meta');

module.exports = class Plugin extends BasePlugin {
	constructor() {
		super();
		this._meta = meta;
	}

	init(context) {
		const { actions, app, licenseContainer, globalTopicTree, brokerManager } = context;
		app.get('/api/system/topictree', (request, response) => {
			if (this.isLoaded()) {
				if (licenseContainer.license.isValid) {
					response.json(globalTopicTree);
				} else {
					response.status(404).send('Not supported with the given license.');
				}
			} else {
				response.status(404).send('Plugin not enabled');
			}
		});
	
		app.delete('/api/system/topictree', (request, response) => {
			if (this.isLoaded()) {
				Object.keys(globalTopicTree).forEach((brokerName) => {
					const topicTree = globalTopicTree[brokerName];
					Object.keys(topicTree).forEach((key) => {
						delete topicTree[key];
					});
					const brokerConnection = brokerManager.getBrokerConnection(brokerName);
					if (brokerConnection) {
						const { broker, system, topicTree } = brokerConnection;
						actions.sendSystemStatusUpdate(system, broker);
						actions.sendTopicTreeUpdate(topicTree, broker);
					}
				});
				response.send();
			} else {
				response.status(404).send();
			}
		});
	}

	get meta() {
		return this._meta;
	}
}
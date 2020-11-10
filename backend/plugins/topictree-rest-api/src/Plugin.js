const BasePlugin = require('../../base/src/BasePlugin');

module.exports = class Plugin extends BasePlugin {
	constructor() {
		super();
		this._meta = {
			"id": "cedalo_topic_tree_rest_api",
			"name": "Cedalo Topic Tree REST API",
			"version":"1.0",
			"description":"Access the topic tree via REST API",
			"feature": "REST API"
		}
	}

	init(context) {
		const { actions, app, licenseContainer, globalTopicTree, brokerManager } = context;
		app.get('/api/system/topictree', (request, response) => {
			if (licenseContainer.license.isValid) {
				response.json(globalTopicTree);
			} else {
				response.status(404).send('Not supported with the given license.');
			}
		});
	
		app.delete('/api/system/topictree', (request, response) => {
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
		});
	}

	load(context) {
	}

	get meta() {
		return this._meta;
	}
}
const BasePlugin = require('../../BasePlugin');
const meta = require('./meta');
const { createActions } = require('./actions');

module.exports = class Plugin extends BasePlugin {
	constructor() {
		super(meta);
	}

	init(context) {
		this._context = context;
		const { requestHandlers } = context;
		requestHandlers.set('connectServerToBroker', 'connect-disconnect/connectToBroker');
		requestHandlers.set('disconnectServerFromBroker', 'connect-disconnect/disconnectFromBroker');
		const { connectServerToBrokerAction, disconnectServerFromBroker } = createActions(this);
		context.registerAction(connectServerToBrokerAction);
		context.registerAction(disconnectServerFromBroker);
	}
};

module.exports = class BrokerManager {
	constructor() {
		// TODO: merge _connection and _brokerConnection
		this._connection = {};
		this._brokerConnection = {};
	}

	handleNewBrokerConnection(connection, brokerClient, system, topicTree) {
		this._brokerClient = brokerClient;
		this._connection = connection;
		this._brokerConnection = {
			broker: brokerClient,
			system,
			topicTree
		};
	}

	handleNewClientWebSocketConnection(ws) {}

	getBrokerConnection(brokerName) {
		return this._brokerConnection;
	}

	getBrokerConnections() {
		return [this._connection];
	}

	connectClient(client, broker) {}

	disconnectClient(client) {}

	getBroker(client) {
		return this._brokerClient;
	}
};

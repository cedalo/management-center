module.exports = class BrokerManager {
	constructor() {
		this._brokerConnectionName = '';
		this._brokerConnection = {};
	}

	handleNewBrokerConnection(connection, brokerClient, system, topicTree) {
		this._brokerClient = brokerClient;
		this._brokerConnectionName = connection.name;
		this._brokerConnection = {
			broker: brokerClient,
			system,
			topicTree
		}
	}

	handleNewClientWebSocketConnection(ws) {
	}

	getBrokerConnection(brokerName) {
		return this._brokerConnection;
	}

	getBrokerConnections() {
		return [ this._brokerConnectionName ];
	}

	connectClient(client, broker) {
	}

	disconnectClient(client) {
	}

	getBroker(client) {
		return this._brokerClient;
	}

}

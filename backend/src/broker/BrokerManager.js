module.exports = class BrokerManager {
	constructor() {
		// TODO: merge _connection and _brokerConnection
		this._connection = null;
		this._brokerConnection = null;
		this._clientConnections = new Map();
	}

	handleNewBrokerConnection(connection, brokerClient, system, topicTreeManager, proxyClient) {
		this._brokerClient = brokerClient;
		this._connection = connection;
		this._brokerConnection = {
			connection,
			name: connection.name,
			broker: brokerClient,
			system,
			topicTreeManager,
			proxyClient
		};
	}

	handleDeleteBrokerConnection(connection) {
		this._brokerClient = null;
		this._brokerConnection = null;
		this._connection = null;
		this._clientConnections = new Map();
	}

	handleNewClientWebSocketConnection(ws) {
		this._clientConnections.set(ws, ws);
	}

	handleCloseClientWebSocketConnection(ws) {
		this._clientConnections.delete(ws);
	}


	getBrokerConnection(brokerName) {
		return this._brokerConnection;
	}

	getBrokerConnectionById(brokerId) {
		return this._brokerConnection;
	}

	getBrokerConnections() {
		return this._connection ? [this._connection] : [];
	}

	connectClient(client, broker) { }

	disconnectClient(client) { }

	getBroker(client) {
		return this._brokerClient;
	}

	getBrokerConnectionByClient(client) {
		return this._connection;
	}
};

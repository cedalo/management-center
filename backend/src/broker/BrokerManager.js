module.exports = class BrokerManager {
	constructor() {
		// TODO: merge _connection and _brokerConnection
		this._connection = {};
		this._brokerConnection = {};
		this._clientConnections = new Map();
	}

	handleNewBrokerConnection(connection, brokerClient, system, topicTree, proxyClient) {
		this._brokerClient = brokerClient;
		this._connection = connection;
		this._brokerConnection = {
			name: connection.name,
			broker: brokerClient,
			system,
			topicTree,
			proxyClient
		};
	}

	handleDeleteBrokerConnection(connection) {
		this._brokerClient = null;
		this._brokerConnection = null;
		this._connection = {};
		this._brokerConnection = {};
		this._clientConnections = new Map();
	}

	handleNewClientWebSocketConnection(ws) {
		this._clientConnections.set(ws, ws);
	}

	handleCloseClientWebSocketConnection(ws) {
		this._clientConnections.delete(ws);
	}

	getClientWebSocketConnections() {
		return this._clientConnections;
	}

	getBrokerConnection(brokerName) {
		return this._brokerConnection;
	}

	getBrokerConnectionById(brokerId) {
		return this._brokerConnection;
	}

	getBrokerConnections() {
		return [this._connection];
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

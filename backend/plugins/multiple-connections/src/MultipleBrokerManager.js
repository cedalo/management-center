module.exports = class MultipleBrokerManager {
	constructor(maxBrokerConnenctions) {
		this._maxBrokerConnenctions = maxBrokerConnenctions;
		this._brokerConnections = new Map();
		this._clientConnections = new Map();
		this._clientBrokerMappings = new Map();
	}

	handleNewBrokerConnection(connection, brokerClient, system, topicTree) {
		if (this._brokerConnections.size < this._maxBrokerConnenctions) {
			this._brokerConnections.set(connection.name, {
				broker: brokerClient,
				system,
				topicTree
			});
		} else {
			// TODO: send error to client
			console.error(`License does not allow more than ${this._maxBrokerConnenctions} broker connections.`);
		}
	}

	handleNewClientWebSocketConnection(ws) {
		this._clientConnections.set(ws, ws);
	}

	getBrokerConnection(brokerName) {
		return this._brokerConnections.get(brokerName);
	}

	getBrokerConnections() {
		return Array.from(this._brokerConnections.keys());
	}

	connectClient(client, broker) {
		this._clientBrokerMappings.set(client, broker);
	}

	disconnectClient(client) {
		this._clientBrokerMappings.set(client, null);
	}

	getBroker(client) {
		return this._clientBrokerMappings.get(client);
	}
}
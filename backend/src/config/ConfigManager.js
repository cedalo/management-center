const path = require('path');
const low = require('lowdb');
const FileSync = require('lowdb/adapters/FileSync');

const configFile = process.env.CEDALO_MC_PROXY_CONFIG || path.join(process.env.CEDALO_MC_PROXY_CONFIG_DIR || __dirname, 'config.json');
const adapter = new FileSync(configFile);
const db = low(adapter);

module.exports = class ConfigManager {

	constructor(maxBrokerConnections) {
		this._maxBrokerConnections = maxBrokerConnections;
	}

	get config() {
		return db.value();
	}

	get connections() {
		let connections = db.get('connections').value();
		if (connections.length > this._maxBrokerConnections) {
			connections = connections.slice(0, this._maxBrokerConnections);
		}
		return connections;
	}

	set connections(connections) {
		db.update('connections', (oldConnections) => connections).write();
	}

	getConnection(id) {
		const connection = this.connections.find((connectionObject) => connectionObject.id === id);
		return connection;
	}

	createConnection(connection) {
		if (db.get('connections').value().length >= this._maxBrokerConnections) {
			throw new Error('Max broker connections reached.');
		}
		db.get('connections')
			.push(connection)
			.write();
	}

	updateConnection(oldConnectionId, connection) {
		db.get('connections')
			.find({ id: oldConnectionId })
			.assign(connection)
			.write();
	}

	deleteConnection(id) {
		db.get('connections')
			.remove({ id })
			.write();
	}
};

const path = require('path');
const low = require('lowdb');
const FileSync = require('lowdb/adapters/FileSync');
const { isObject } = require('util');

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

	filterConnectionObject(connection) {
		return {
			id: connection.id,
			name: connection.name,
			url: connection.url,
			credentials: {
				username: connection.credentials?.username,
				password: connection.credentials?.password,
			}
		};
	}

	createConnection(connection) {
		if (!isObject(connection) || (isObject(connection) && (Object.keys(connection).length === 0))) {
			throw new Error('Connection is of invalid type/empty/not provided');
		}

		const connections = db.get('connections').value();
		connections.forEach((el) => {
			if (el.name === connection.name || el.id === connection.id) {
				throw new Error('Connection with the same name/id already exists');
			}
		})

		const connectionToSave = this.filterConnectionObject(connection);

		if (db.get('connections').value().length >= this._maxBrokerConnections) {
			throw new Error('Max broker connections reached');
		}
		db.get('connections')
			.push(connectionToSave)
			.write();
	}

	updateConnection(oldConnectionId, connection) {
		if (!isObject(connection)) {
			throw new Error('Connection is of invalid type/empty/not provided');
		}

		const newConnection = this.filterConnectionObject(connection);

		const result = db.get('connections')
			.find({ id: oldConnectionId })
			.assign({...newConnection})
			.write();
		return result;
	}

	// updateConnection(oldConnectionId, connection) {
	// 	const a =  {...connection};
	// 	// if (!connection)
	// 	// 	return;
	// 	const b = db.get('connections').find({ id: oldConnectionId });

	// 	const result = db.get('connections')
	// 		.find({ id: oldConnectionId })
	// 		.assign({...connection})
	// 		.write();
	// 	return result;
	// }

	deleteConnection(id) {
		db.get('connections')
			.remove({ id })
			.write();
	}
};

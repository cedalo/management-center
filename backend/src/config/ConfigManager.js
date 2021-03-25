const path = require('path');
const low = require('lowdb');
const FileSync = require('lowdb/adapters/FileSync');

const configFile = process.env.CEDALO_MC_PROXY_CONFIG || path.join(process.env.CEDALO_MC_PROXY_CONFIG_DIR || __dirname, 'config.json');
const adapter = new FileSync(configFile);
const db = low(adapter);

module.exports = class ConfigManager {

	get config() {
		return db.value();
	}

	get connections() {
		return db.get('connections').value();
	}

	set connections(connections) {
		db.update('connections', (oldConnections) => connections).write();
	}

	createConnection(connection) {
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
};

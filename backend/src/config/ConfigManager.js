const path = require('path');
const low = require('lowdb');
const FileSync = require('lowdb/adapters/FileSync');
const { reverseMap } = require('../utils/utils');
const { isObject } = require('util');
const { URL } = require('url');


const DOCKER_ENV = process.env.CEDALO_DOCKER_ENV;
const configFile = process.env.CEDALO_MC_PROXY_CONFIG || path.join(process.env.CEDALO_MC_PROXY_CONFIG_DIR || __dirname, 'config.json');
const adapter = new FileSync(configFile);
const db = low(adapter);


const dockerEnvStringToMap = (string) => {
	const map = new Map();
	const parts = string.split(';');

	for (const part of parts) {
		const [key, value] = part.split(':');
		map.set(key, value);
	}

	return map;
};


module.exports = class ConfigManager {

	constructor(maxBrokerConnections) {
		this._maxBrokerConnections = maxBrokerConnections;
		// construct objects from env vars
		this.dockerEnv = DOCKER_ENV;
		if (this.dockerEnv) {
			this.externalHostnamesMap = dockerEnvStringToMap(this.dockerEnv);
			this.internalHostnamesMap = reverseMap(this.externalHostnamesMap);
		}
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

	get plugins() {
		let plugins = db.get('plugins').value();
		return plugins;
	}

	set plugins(plugins) {
		db.update('plugins', (oldPlugins) => plugins).write();
	}

	updatePluginFromConfiguration(pluginId, plugin) {
		if (!isObject(plugin)) {
			throw new Error('Pluin is of invalid type/empty/not provided');
		}

		const pluginName = pluginId.replace('_', '-');

		const result = db.get('plugins')
					.find({ name: pluginName })
					.assign({...plugin})
					.write();

		return result;
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

	processInternalExternalURLs(connection) {
		const hostname = new URL(connection.url).hostname;
		const internalHostname = this.internalHostnamesMap.get(hostname) || hostname;
		const externalHostname = this.externalHostnamesMap.get(hostname) || hostname;

		const internalURL = connection.url.replace(hostname, internalHostname);
		const externalURL = connection.url.replace(hostname, externalHostname);

		return {
			...connection,
			url: internalURL,
			externalUrl: externalURL,
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
		});

		let connectionToSave = this.filterConnectionObject(connection);
		if (this.dockerEnv) {
			connectionToSave = this.processInternalExternalURLs(connectionToSave);
		}

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

		let newConnection = this.filterConnectionObject(connection);
		if (newConnection.url && this.dockerEnv) {
			newConnection = this.processInternalExternalURLs(newConnection);
		}

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

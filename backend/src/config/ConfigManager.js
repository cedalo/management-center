const path = require('path');
const low = require('lowdb');
const FileSync = require('lowdb/adapters/FileSync');
const { reverseMap, removeCircular } = require('../utils/utils');
const { isObject } = require('util');
const { URL } = require('url');
const { createConnection } = require('net');


const DOCKER_ENV = process.env.CEDALO_DOCKER_ENV; // 
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
			this.toExternalHostnamesMap = dockerEnvStringToMap(this.dockerEnv); // map docker servicename to an actual external server url
			this.toInternalHostnamesMap = reverseMap(this.toExternalHostnamesMap); // map external server url to docker servicenames
		}
	}

	get config() {
		return db.value();
	}

	getAllConnections() {
		return db.get('connections').value();
	}

	get connections() {
		let connections = this.getAllConnections();
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

		let pluginName = pluginId.replace('cedalo_', '');
		pluginName = pluginName.replace(/_/g, '-');

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
		const internalHostname = this.toInternalHostnamesMap.get(hostname) || hostname;
		const externalHostname = this.toExternalHostnamesMap.get(hostname) || hostname;

		const internalURL = connection.url.replace(hostname, internalHostname);
		const externalURL = connection.url.replace(hostname, externalHostname);

		return {
			...connection,
			url: internalURL,
			externalUrl: externalURL,
		};
	}


	preprocessConnection(connection) {
		if (!isObject(connection)) {
			throw new Error('Connection is of invalid type/empty/not provided');
		}
		connection = removeCircular(connection);

		let newConnection = this.filterConnectionObject(connection);
		if (newConnection.url && this.dockerEnv) {
			newConnection = this.processInternalExternalURLs(newConnection);
		}

		return newConnection;
	}


	updateConnection(oldConnectionId, connection) {
		const newConnection = this.preprocessConnection(connection);

		const result = db.get('connections')
			.find({ id: oldConnectionId })
			.assign({...newConnection})
			.write();
		return result;
	}



	createConnection(connection) {
		const newConnection = this.preprocessConnection(connection);

		db.get('connections')
			.push(newConnection)
			.write();
	}


	deleteConnection(id) {
		db.get('connections')
			.remove({ id })
			.write();
	}
};

const path = require('path');
const low = require('lowdb');
const FileSync = require('lowdb/adapters/FileSync');
const { removeCircular, stringToBool } = require('../utils/utils');
const { isObject } = require('util');
const { URL } = require('url');
const { getBaseDirectory } = require('../utils/utils');

const CEDALO_MC_BROKER_CONNECTION_HOST_MAPPING = process.env.CEDALO_MC_BROKER_CONNECTION_HOST_MAPPING;
const CEDALO_MC_BROKER_CONNECTION_MQTTS_EXISTS_MAPPING = process.env.CEDALO_MC_BROKER_CONNECTION_MQTTS_EXISTS_MAPPING;
const CEDALO_MC_BROKER_CONNECTION_MQTT_EXISTS_MAPPING = process.env.CEDALO_MC_BROKER_CONNECTION_MQTT_EXISTS_MAPPING;
const CEDALO_MC_BROKER_CONNECTION_WS_EXISTS_MAPPING = process.env.CEDALO_MC_BROKER_CONNECTION_WS_EXISTS_MAPPING;
const CEDALO_MC_BROKER_CONNECTION_MQTT_PORT = process.env.CEDALO_MC_BROKER_CONNECTION_MQTT_PORT;
const CEDALO_MC_BROKER_CONNECTION_MQTTS_PORT = process.env.CEDALO_MC_BROKER_CONNECTION_MQTTS_PORT;
const CEDALO_MC_BROKER_CONNECTION_WEBSOCKET_PATH = process.env.CEDALO_MC_BROKER_CONNECTION_WEBSOCKET_PATH || '/mqtt';
const configFile = process.env.CEDALO_MC_PROXY_CONFIG || path.join(process.env.CEDALO_MC_PROXY_CONFIG_DIR || getBaseDirectory(__dirname), 'config.json');

const adapter = new FileSync(configFile);
const db = low(adapter);


const mapStringToMap = (string, converter=(x) => x) => {
	const map = new Map();
	const parts = string.split(';');

	for (const part of parts) {
		const [key, value] = part.split(':');
		map.set(key, converter(value));
	}

	return map;
};


module.exports = class ConfigManager {

	constructor(maxBrokerConnections) {
		this._maxBrokerConnections = maxBrokerConnections;
		// construct objects from env vars
		this.hostMappingString = CEDALO_MC_BROKER_CONNECTION_HOST_MAPPING;
		this.mqttsMappingString = CEDALO_MC_BROKER_CONNECTION_MQTTS_EXISTS_MAPPING;
		this.mqttMappingString = CEDALO_MC_BROKER_CONNECTION_MQTT_EXISTS_MAPPING;
		this.wsMappingString = CEDALO_MC_BROKER_CONNECTION_WS_EXISTS_MAPPING;

		if (this.hostMappingString) {
			this.toExternalHostnamesMap = mapStringToMap(this.hostMappingString); // map private network address or docker servicename to an actual external server url
		}
		if (this.mqttsMappingString) {
			this.allowEncryptedMap = mapStringToMap(this.mqttsMappingString, stringToBool); // map private network address or docker servicename to a boolean which allows mqtts traffic
		}
		if (this.mqttMappingString) {
			this.allowUnencryptedMap = mapStringToMap(this.mqttMappingString, stringToBool);
		}
		if (this.wsMappingString) {
			this.allowWebsocketsMap = mapStringToMap(this.wsMappingString, stringToBool); 
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

	get parameters() {
		let parameters = db.get('parameters').value();
		return parameters;
	}

	set parameters(parameters) {
		db.update('parameters', (oldParameters) => parameters).write();
	}

	updatePluginFromConfiguration(pluginId, plugin) {
		if (!isObject(plugin)) {
			throw new Error('Plugin is of invalid type/empty/not provided');
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

	filterConnectionObject(connection) { // tls plugin injects its own fucntion here
		const filteredConnection = {
			id: connection.id,
			name: connection.name,
			url: connection.url,
			credentials: {
				username: connection.credentials?.username,
				password: connection.credentials?.password,
			},
			noMetricsMode: connection.noMetricsMode,
		};
		return filteredConnection;
	}

	processInternalExternalURLs(connection) {
		if (connection.internalUrl || connection.websocketsUrl ||
			connection.externalEncryptedUrl || connection.externalUnencryptedUrl
		) {
			return connection;
		}

		const internalMqttPort = CEDALO_MC_BROKER_CONNECTION_MQTT_PORT || 1883;
		const externalMqttsPort = CEDALO_MC_BROKER_CONNECTION_MQTTS_PORT || 8883;
		const externalMqttPort = internalMqttPort
		const hostname = new URL(connection.url).hostname;
		const externalHostname = this.toExternalHostnamesMap?.get(hostname) || null;
		const allowUnencrypted = this.allowUnencryptedMap?.get(hostname) || null;
		const allowEncrypted = this.allowEncryptedMap?.get(hostname) || null;
		const allowWebsockets = this.allowWebsocketsMap?.get(hostname) || null;

		let externalWebsocketsUrl = null;
		let externalEncryptedUrl = null;
		let externalUnencryptedUrl = null;

		if (externalHostname) {
			if (allowEncrypted) {
				externalEncryptedUrl = 'mqtts://' + externalHostname + `:${externalMqttsPort}`; // modify externalURL
			}
			if (allowUnencrypted) {
				externalUnencryptedUrl = 'mqtt://' + externalHostname + `:${externalMqttPort}`; // modify externalURL
			}
			if (allowWebsockets) {
				externalWebsocketsUrl = 'wss://' + externalHostname + CEDALO_MC_BROKER_CONNECTION_WEBSOCKET_PATH || '/mqtt'; // TODO use URL object to safely concat to url
			}
		}

		const resultingConnection = {
			...connection,
			url: connection.url,
			internalUrl: ((externalEncryptedUrl || externalUnencryptedUrl)  && connection.url) || null, /*if extenal url fouund this means we are using internal url to connect*/
			websocketsUrl: externalWebsocketsUrl || null,
			// externalEncryptedUrl: externalEncryptedUrl || (connection.url.includes('mqtts://') && connection.url) || null, // if externalEncryptedURL not found this means that we are already using external url (in connection.url) to connect
			externalEncryptedUrl: externalEncryptedUrl || null,
			// externalUnencryptedUrl: externalUnencryptedUrl || (connection.url.includes('mqtt://') && connection.url) || null, // if externalUnencryptedURL not found this means that we are already using external url (in connection.url) to connect
			externalUnencryptedUrl: externalUnencryptedUrl || null,
		};
		return resultingConnection;
	}


	preprocessConnection(connection, keepStatusProperty=false) {
		if (!isObject(connection)) {
			throw new Error('Connection is of invalid type/empty/not provided');
		}
		connection = removeCircular(connection);

		// keepStatusProperty is true during the first server connection to all the brokers. This is done to respect the previous status of the connection and act accordingly.
		// otherwise, the status property would have been filtered out from the connection
		// cases when we want to filter it out from the connection object include receiving connection object form the frontend in order to ensure integrity of our db data
		if (keepStatusProperty && connection.status === undefined) { // in case connections status is not defined, which is common for old config files
			connection.status  = {
				"connected": false,
				"timestamp": null
			}
		}

		let newConnection = this.filterConnectionObject(connection);
		if (newConnection.url && this.hostMappingString) {
			newConnection = this.processInternalExternalURLs(newConnection);
		}

		if (keepStatusProperty) {
			newConnection.status = JSON.parse(JSON.stringify(connection.status)); // make a json deep copy here
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


	saveConnection(connection, connectionId) {
		const result = db.get('connections')
			.find({ id: connectionId ? connectionId : connection.id })
			.assign({...connection})
			.write();
		return result;	
	}


	createConnection(connection) {
		const newConnection = this.preprocessConnection(connection);

		newConnection.status = {
			connected: false,
			timestamp: Date.now()
		};

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

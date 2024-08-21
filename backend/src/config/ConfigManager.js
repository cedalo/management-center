const path = require('path');
const low = require('lowdb');
const FileSync = require('lowdb/adapters/FileSync');
const { removeCircular, stringToBool } = require('../utils/utils');
const { isObject } = require('util');
const { URL } = require('url');
const { getBaseDirectory } = require('../utils/utils');
const { Mutex } = require('async-mutex');
const mutex = new Mutex();

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


const processOldPluginsInConfig = (plugins) => {
	// this function just converts [{name: plugin}] to [{id: plugin}]
	let isOldConfigFile = false;
	const processedPlugins = []
	if (plugins && Array.isArray(plugins)) {
		for (const plugin of plugins) {
			if (plugin.name) {
				isOldConfigFile = true;
				processedPlugins.push({id: plugin.name});
			} else if (plugin.id) {
				processedPlugins.push(plugin);
			}
		}

		return {plugins: processedPlugins, isOldConfigFile};
	}
	return {plugins: null, isOldConfigFile};
};

module.exports = class ConfigManager {

	constructor(maxBrokerConnections, pluginList) {
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

		this._synchronizePluginsToLoad(pluginList)
	}

	_synchronizePluginsToLoad(pluginList) {
		const findPluginInConfig = (pluginId) => {
			const plugins = this.plugins;
			if (plugins && Array.isArray(plugins)) {
				const foundPlugin = plugins.find((el) => el.id === pluginId);
				return foundPlugin;
			}
			return undefined;
		}

		// if no plugins to load or plugin list is null then return right away
		// if plugins = [] it means that no plugins will be loaded except OSS ones
		// if plugins = 'all' then it means that everything from the license will be loaded
		// if plugins = null this means that plugin.json file doesn't exist and we should either check for existing plugins in config file or load all
		let explicitPluginLoad = true;
		let plugins = [];
		
		// if (pluginList) {
		// 	this.loadMode = {...this.loadMode, softMode: false};
		// }
		
		if (pluginList === 'all') {
			this.plugins = null;
			pluginList = [];
		} else if (!pluginList) {
			const processedPluginsObject = processOldPluginsInConfig(this.plugins);
			const noPluginsFoundInConfig = !processedPluginsObject.plugins;
			const pluginsWereImplicitlyLoadedBefore = this.loadMode.explicitPluginLoad === false;

			if ((!processedPluginsObject.isOldConfigFile && pluginsWereImplicitlyLoadedBefore)
			|| noPluginsFoundInConfig) {
				// was loaded with license before
				explicitPluginLoad = false;
				// plugins stay implicetely loaded
			} else { // if plugins were loaded explicitly before or we have an old config file
				if (!Array.isArray(processedPluginsObject.plugins)) {
					throw new Error('Invalid plugins entry in config file. Must be an array of objects');
				}
				plugins = processedPluginsObject.plugins;
			}
		} else if (!Array.isArray(pluginList)) {
			throw new Error('Invalid plugins entry in plugin list file. Must be an array of objects');
		} else {
			// if pluginList exists then update (and sync) the plugins in config
			for (const plugin of pluginList) {
			// in case plugins.json list of plugins changed, we need to synchronize it with plugins section in config.json
				if (!plugin.id) {
					console.error('Invalid plugin entry in plugin list:', plugin);
					continue;
				}
				const pluginInConfig = findPluginInConfig(plugin.id);
				if (pluginInConfig) {
					plugins.push(pluginInConfig);
				} else {
					plugins.push({id: plugin.id});
				}
			}
		}

		this.loadMode = {...this.loadMode, explicitPluginLoad: explicitPluginLoad};

		if (explicitPluginLoad) {
			// hard mode
			this.softMode = false;
			this.plugins = plugins;
		} else { // if plugins were loaded implicitly (everything that is in the license) before
			// soft mode
			this.softMode = true;
			this.plugins = null;
		}
	}

	get config() {
		return db.value();
	}

	get loadMode() {
		const loadMode = db.get('loadMode').value();
		return loadMode || {};
	}

	set loadMode(newMode) {
		db.update('loadMode', (oldMode) => newMode).write();
	}

	get softMode() {
		const softMode = db.get('softMode').value();
		return softMode;
	}

	set softMode(newMode) {
		db.update('softMode', (oldMode) => newMode).write();
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

	updatePluginFromConfiguration(pluginId, plugin) { //!!!
		if (!isObject(plugin)) {
			throw new Error('Plugin is of invalid type/empty/not provided');
		}

		const result = db.get('plugins')
					.find({ id: pluginId })
					.assign({...plugin})
					.write();
		
		this.loadMode = {...this.loadMode, explicitPluginLoad: true}; // set explicit plugin load because user changed the list of loaded plugins manually. Now this change should be respected on next startup and plugin load
		this.softMode = false;

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
			url: connection.url?.trim(),
			credentials: {
				username: connection.credentials?.username?.trim() || undefined,
				password: connection.credentials?.password,
				clientId: connection.credentials?.clientId?.trim() || undefined,
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
		const isConnectionAnObject = (connection !== null && typeof connection === 'object');
		if (!isConnectionAnObject) {
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


	async updateConnection(oldConnectionId, connection) {
		const newConnection = this.preprocessConnection(connection);

		const release = await mutex.acquire();
		try {
			const result = db.get('connections')
				.find({ id: oldConnectionId })
				.assign({...newConnection})
				.write();
			return result;
		} finally {
			release();
		}
	}


	async saveConnection(connection, connectionId) {
		const release = await mutex.acquire();
		try {
			const result = db.get('connections')
			.find({ id: connectionId ? connectionId : connection.id })
			.assign({...connection})
			.write();
			return result;
		} finally {
			release();
		}
	}


	async createConnection(connection) {
		const newConnection = this.preprocessConnection(connection);

		newConnection.status = {
			connected: false,
			timestamp: Date.now()
		};

		const release = await mutex.acquire();
		try {
			db.get('connections')
				.push(newConnection)
				.write();
		} finally {
			release();
		}
	}


	async deleteConnection(id) {
		const release = await mutex.acquire();
		try {
			db.get('connections')
				.remove({ id })
				.write();
		} finally {
			release();
		}
	}
};

const path = require('path');

const PLUGIN_DIR = process.env.CEDALO_MC_PLUGIN_DIR;

module.exports = class PluginManager {
	constructor() {
		this._plugins = [];
	}

	_loadOSPlugins(context) {
		// TODO: support multiple plugins
		if (process.env.CEDALO_MC_DISABLE_LOGIN !== 'true') {
			this._loadLoginPlugin(context);
			this._loadConnectDisconnectPlugin(context);
			this._loadUserProfilePlugin(context);
		}
	}

	_loadLoginPlugin(context) {
		const { Plugin } = require('./login');
		const plugin = new Plugin();
		this._loadPlugin(plugin, context);
	}

	_loadConnectDisconnectPlugin(context) {
		const { Plugin } = require('./connect-disconnect');
		const plugin = new Plugin();
		this._loadPlugin(plugin, context);
	}

	_loadUserProfilePlugin(context) {
		const { Plugin } = require('./user-profile');
		const plugin = new Plugin();
		this._loadPlugin(plugin, context);
	}

	_loadPlugin(plugin, context) {
		try {
			plugin.init(context);
			plugin.load(context);
			plugin.setLoaded();
			this._plugins.push(plugin);
			console.log(`Loaded plugin: "${plugin.meta.id}" (${plugin.meta.name})`);
		} catch (error) {
			console.error(`Failed loading plugin: "${plugin.meta.id}" (${plugin.meta.name})`);
			console.error(error);
			this._plugins.push(plugin);
		}
	}

	init(pluginConfigurations = [], context, swaggerDocument) {
		if (!PLUGIN_DIR) {
			console.log('"CEDALO_MC_PLUGIN_DIR" is not set. Skipping loading of plugins');
			return;
		}
		this._context = context;
		const { licenseContainer } = context;
		if (licenseContainer.license.isValid) {
			pluginConfigurations.forEach((pluginConfiguration) => {
				try {
					const { Plugin } = require(path.join(PLUGIN_DIR, pluginConfiguration.name));
					const plugin = new Plugin();
					if (
						licenseContainer.license.features &&
						licenseContainer.license.features.find(feature => plugin.meta.featureId === feature.name)
					) {
						this._plugins.push(plugin);
					} else {
						plugin.setErrored(`License does not allow this plugin: "${pluginConfiguration.name}"`);
						this._plugins.push(plugin);
					}
				} catch (error) {
					console.error(`Failed loading plugin: "${pluginConfiguration.name}"`);
					console.error(error);
					// plugin.setErrored();
				}
			});
		} else {
			console.error('Ignore loading plugins: no premium license provided or license not valid');
		}
		
		this._plugins.forEach(plugin => {
			if (plugin.preInit) {
				plugin.preInit(context);
			}
		});

		this._loadOSPlugins(context);

		this._plugins.forEach(plugin => {
			try {
				plugin.init(context);
				plugin.load(context);
				if (plugin.swagger) {
					swaggerDocument.paths = Object.assign(swaggerDocument.paths, plugin.swagger().paths);
				}
				plugin.setLoaded();
				console.log(`Loaded plugin: "${plugin.meta.id}" (${plugin.meta.name})`);
			} catch(error) {
				console.error(`Failed loading plugin: "${plugin.meta.id}" (${plugin.meta.name})`);
				console.error(error);
			}
		});
	}

	add(plugin) {
		this._plugins.push(plugin);
	}

	_getPluginById(pluginId) {
		return this._plugins.find((plugin) => plugin.meta.id === pluginId);
	}

	unloadPlugin(pluginId) {
		const plugin = this._getPluginById(pluginId);
		plugin.unload(this._context);
	}

	loadPlugin(pluginId) {
		const plugin = this._getPluginById(pluginId);
		plugin.load(this._context);
	}

	get plugins() {
		return this._plugins;
	}
};

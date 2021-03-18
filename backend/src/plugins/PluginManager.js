const path = require('path');

const PLUGIN_DIR = process.env.CEDALO_MC_PLUGIN_DIR;

module.exports = class PluginManager {
	constructor() {
		this._plugins = [];
	}

	_loadOSPlugins(context) {
		// TODO: support multiple plugins
		const { Plugin } = require('./login');
		const plugin = new Plugin();
		try {
			plugin.init(context);
			plugin.load(context);
			plugin.setLoaded();
			this._plugins.push(plugin);
		} catch (error) {
			plugin.setErrored(`Could not load plugin. Reason: ${error}`);
			this._plugins.push(plugin);
		}
	}

	init(pluginConfigurations = [], context) {
		this._loadOSPlugins(context);
		if (!PLUGIN_DIR) {
			console.log('"CEDALO_MC_PLUGIN_DIR" is not set. Skipping loading of plugins');
			return;
		}
		this._context = context;
		const { licenseContainer } = context;
		pluginConfigurations.forEach((pluginConfiguration) => {
			try {
				const { Plugin } = require(path.join(PLUGIN_DIR, pluginConfiguration.name));
				const plugin = new Plugin();
				if (
					licenseContainer.license.features &&
					licenseContainer.license.features.includes(plugin.meta.featureId)
				) {
					plugin.init(context);
					plugin.load(context);
					plugin.setLoaded();
					this._plugins.push(plugin);
				} else {
					plugin.setErrored('License does not allow this plugin.');
					this._plugins.push(plugin);
				}
			} catch (error) {
				console.error(`Failed loading plugin`);
				console.error(error);
				// plugin.setErrored();
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

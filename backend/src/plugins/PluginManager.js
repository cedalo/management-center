module.exports = class PluginManager {
	constructor() {
		this._plugins = [];
	}

	init(pluginConfigurations = [], context) {
		this._context = context;
		const { licenseContainer } = context;
		pluginConfigurations.forEach((pluginConfiguration) => {
			try {
				const { Plugin } = require(`../../plugins/${pluginConfiguration.name}`);
				const plugin = new Plugin();
				if (licenseContainer.license.features.includes(plugin.meta.featureId)) {
					plugin.init(context);
					plugin.load(context);
					plugin.setLoaded();
					this._plugins.push(plugin);
				} else {
					plugin.setErrored('License does not contain this feature.');
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
	get plugins() {
		return this._plugins;
	}
}
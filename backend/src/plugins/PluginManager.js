module.exports = class PluginManager {
	constructor() {
		this._plugins = [];
	}

	init(pluginConfigurations = [], context) {
		pluginConfigurations.forEach((pluginConfiguration) => {
			try {
				const { Plugin } = require(`../../plugins/${pluginConfiguration.name}`);
				const plugin = new Plugin();
				plugin.init(context);
				plugin.load(context);
				plugin.setLoaded();
				this._plugins.push(plugin);
			} catch (error) {
				console.error(`Failed loading plugin`);
				console.error(error);
				plugin.setErrored();
			}
		});
	}

	add(plugin) {
		this._plugins.push(plugin);
	}

	get plugins() {
		return this._plugins;
	}
}
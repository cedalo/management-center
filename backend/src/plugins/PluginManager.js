module.exports = class PluginManager {
	constructor() {
		this._plugins = [];
	}

	init(pluginNames, context) {
		pluginNames.forEach((pluginName) => {
			try {
				const { Plugin } = require(`../../plugins/${pluginName}`);
				const plugin = new Plugin();
				plugin.init(context);
				plugin.load(context);
				this._plugins.push(plugin);
			} catch (error) {
				console.error(`Failed loading plugin`);
				console.error(error);
			}
		});
	}

	get plugins() {
		return this._plugins;
	}
}
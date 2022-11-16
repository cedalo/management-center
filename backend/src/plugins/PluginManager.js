const path = require('path');

const PLUGIN_DIR = process.env.CEDALO_MC_PLUGIN_DIR;
const LOGIN_PLUGIN_FEATURE_IDS = ['saml-sso'];
const OS_PLUGINS_IDS = ['cedalo_login', 'cedalo_user_profile', 'cedalo_connect_disconnect'];


module.exports = class PluginManager {
	constructor() {
		this._plugins = [];
	}

	_enabledCustomLoginPlugin() {
		for (const plugin of this._plugins) {
			if (plugin._status.type !== 'error') {
				if (LOGIN_PLUGIN_FEATURE_IDS.includes(plugin.meta.featureId)) {
					return true;
				}
			}
		}
		return false;
	}


	_loadOSPlugins(context) {
		// TODO: support multiple plugins
		if (process.env.CEDALO_MC_DISABLE_LOGIN !== 'true') {
			if (!this._enabledCustomLoginPlugin()) {
				this._loadLoginPlugin(context);
			}

			this._loadUserProfilePlugin(context);
			this._loadConnectDisconnectPlugin(context);
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
			this._plugins.unshift(plugin);
		} catch (error) {
			plugin.setErrored(`Failed loading plugin: "${plugin.meta.id}" (${plugin.meta.name})`);
			this._plugins.unshift(plugin);
		}
	}


	_sortPluginList(plugins) {
		// load user management as a first plugin since we redefine isAdmin and alike functions there
		// also load application-tokens first as it redefines isLoggedIn function
		// saml-sso redefines the whole login
		const PLUGIN_IDS_OF_HIGHEST_PRIORITY = ['saml_sso', ...OS_PLUGINS_IDS, 'application_tokens', 'user_management'];

		for (const pluginId of PLUGIN_IDS_OF_HIGHEST_PRIORITY.reverse()) {
			const pluginIndex = plugins.findIndex((el) => {
				return el._meta.id === pluginId;
			});
			if (pluginIndex !== -1) {
				const plugin = plugins[pluginIndex];
				plugins.splice(pluginIndex, 1);
				plugins.unshift(plugin);
			}
		}
	}


	init(pluginConfigurations = [], context, swaggerDocument) {
		this._context = context;
		const { licenseContainer } = context;
		if (licenseContainer.license.isValid && PLUGIN_DIR) {
			pluginConfigurations.forEach((pluginConfiguration) => {
				try {
					const enableAtNextStartup = (pluginConfiguration.enableAtNextStartup !== undefined) ? pluginConfiguration.enableAtNextStartup : true;

					const { Plugin } = require(path.join(PLUGIN_DIR, pluginConfiguration.name));
					const plugin = new Plugin({enableAtNextStartup, context});
					if (licenseContainer.license.features &&
						licenseContainer.license.features.find(feature => plugin.meta.featureId === feature.name)
					) {
						if (!enableAtNextStartup) {
							console.log(`Plugin not loaded: Plugin set to be disabled at current startup: "${pluginConfiguration.name}"`)
							plugin.setErrored(`Plugin set to be disabled at current startup: "${pluginConfiguration.name}"`);
							this._plugins.push(plugin);
						} else {
							this._plugins.push(plugin);
						}
					} else {
						console.log(`Plugin not loaded: License does not allow this plugin: "${pluginConfiguration.name}"`)
						plugin.setErrored(`License does not allow this plugin: "${pluginConfiguration.name}"`);
						this._plugins.push(plugin);
					}
				} catch (error) {
					console.error(`Failed loading plugin: "${pluginConfiguration.name}"`);
					console.error(error);
				}
			});
		} else if (licenseContainer.license.isValid && !PLUGIN_DIR) {
			console.log('"CEDALO_MC_PLUGIN_DIR" is not set. Skipping loading of plugins');
		} else {
			console.error('Ignore loading plugins: no premium license provided or license not valid');
		}

		this._plugins.forEach(plugin => {
			if (plugin.preInit) {
				plugin.preInit(context);
			}
		});

		this._loadOSPlugins(context);

		this._sortPluginList(this._plugins);

		this._plugins.forEach(plugin => {
			try {
				plugin.init(context);
				if (plugin.swagger) {
					swaggerDocument.tags = Object.assign(swaggerDocument.tags || {}, plugin.swagger.tags);
					swaggerDocument.paths = Object.assign(swaggerDocument.paths || {}, plugin.swagger.paths);
					swaggerDocument.components.schemas = Object.assign(swaggerDocument.components.schemas || {}, plugin.swagger.components?.schemas);
					swaggerDocument.components.errors = Object.assign(swaggerDocument.components.errors || {}, plugin.swagger.components?.errors);
				}

				if (plugin._status.type !== 'error') {
					plugin.load(context);
					plugin.setLoaded();
					console.log(`Loaded plugin: "${plugin.meta.id}" (${plugin.meta.name})`);
				}

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

	setPluginStatusAtNextStartup(pluginId, nextStatus) {
		this._plugins = this._plugins.map((plugin) => {
			if (plugin.meta.id === pluginId) {
				if (plugin.meta.type !== 'os') {
					plugin.options.enableAtNextStartup = nextStatus;
				}
			}
			return plugin;
	
		});	

		this._context.configManager.updatePluginFromConfiguration(pluginId, {enableAtNextStartup: nextStatus});
	}

	get plugins() {
		return this._plugins;
	}
};

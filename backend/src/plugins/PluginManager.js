const fs = require('fs');
const path = require('path');

const { getBaseDirectory, removeDuplicates } = require('../utils/utils');

const CUSTOM_LOGIN_PLUGIN_FEATURE_IDS = ['saml-sso'];
const OS_PLUGINS_IDS = ['login', 'user-profile', 'connect-disconnect'];
const CEDALO_MC_OFFLINE = process.env.CEDALO_MC_MODE === 'offline';
const CEDALO_MC_PLUGIN_LIST_PATH = process.env.CEDALO_MC_PLUGIN_LIST_PATH;

module.exports = class PluginManager {
	constructor() {
		this._plugins = [];
	}

	static loadPluginList() {
		let plugins;
		try {
			const pathToPluginList = CEDALO_MC_PLUGIN_LIST_PATH || path.join(getBaseDirectory(__dirname), 'plugins.json');
			plugins = fs.readFileSync(pathToPluginList, 'utf8');
			plugins = JSON.parse(plugins);
		} catch	(error) {
			if (CEDALO_MC_PLUGIN_LIST_PATH) { // if we explicitely defined where plugin list should be loacated and it failed to load, then we display an error
				console.error(`Failed loading plugin list: "${CEDALO_MC_PLUGIN_LIST_PATH}"`);
				console.error(error);
			}
			return null;
		}
		return plugins.plugins || null;
	}

	_enabledCustomLoginPlugin() {
		for (const plugin of this._plugins) {
			if (plugin._status.type !== 'error') {
				if (CUSTOM_LOGIN_PLUGIN_FEATURE_IDS.includes(plugin.meta.featureId)) {
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
		// multiple-connections add MultiBrokerManager to context which is needed by cert management plugin
		const PLUGIN_IDS_OF_HIGHEST_PRIORITY = ['multiple-connections', /* 'login_rate_limit' */, 'saml-sso', ...OS_PLUGINS_IDS, 'application-tokens', 'user-management'];

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

	_preprocessRequiredPlugin(pluginClass, pluginConfiguration) {
		const enablePlugin = (pluginConfiguration.enableAtNextStartup !== undefined) ? !!pluginConfiguration.enableAtNextStartup : true;

		return {
			Plugin: pluginClass,
			enable: enablePlugin,
		};
	}

	_requirePlugins(pluginList) {
		const plugins = [];
		let pluginClass;

		const load = (pluginConfiguration, plugins) => {
			if (pluginConfiguration.id === 'application-tokens' || pluginConfiguration.id === 'all') {
				try {
					pluginClass = require('../../../../plugins/application-tokens').Plugin;
					const requiredPluginObject = this._preprocessRequiredPlugin(pluginClass, pluginConfiguration);
					plugins.push(requiredPluginObject);
				} catch(error) {
					console.error('Plugin "application-tokens" not found');
				}
			}

			if (pluginConfiguration.id === 'audit-trail' || pluginConfiguration.id === 'all') {
				try {
					pluginClass = require('../../../../plugins/audit-trail').Plugin;
					const requiredPluginObject = this._preprocessRequiredPlugin(pluginClass, pluginConfiguration);
					plugins.push(requiredPluginObject);
				} catch(error) {
					console.error('Plugin "audit-trail" not found');
				}
			}

			if (pluginConfiguration.id === 'broker-restart' || pluginConfiguration.id === 'all') {
				try {
					pluginClass = require('../../../../plugins/broker-restart').Plugin;
					const requiredPluginObject = this._preprocessRequiredPlugin(pluginClass, pluginConfiguration);
					plugins.push(requiredPluginObject);
				} catch(error) {
					console.error('Plugin "broker-restart" not found');
				}
			}

			if (pluginConfiguration.id === 'cert-management' || pluginConfiguration.id === 'all') {
				try {
					pluginClass = require('../../../../plugins/cert-management').Plugin;
					const requiredPluginObject = this._preprocessRequiredPlugin(pluginClass, pluginConfiguration);
					plugins.push(requiredPluginObject);
				} catch(error) {
					console.error('Plugin "cert-management" not found');
				}
		    }

			if (pluginConfiguration.id === 'client-control' || pluginConfiguration.id === 'all') {
				try {
					pluginClass = require('../../../../plugins/client-control').Plugin;
					const requiredPluginObject = this._preprocessRequiredPlugin(pluginClass, pluginConfiguration);
					plugins.push(requiredPluginObject);
				} catch(error) {
					console.error('Plugin "client-control" not found');
				}
		    }

			if (pluginConfiguration.id === 'cluster-management' || pluginConfiguration.id === 'all') {
				try {
					pluginClass = require('../../../../plugins/cluster-management').Plugin;
					const requiredPluginObject = this._preprocessRequiredPlugin(pluginClass, pluginConfiguration);
					plugins.push(requiredPluginObject);
				} catch(error) {
					console.error('Plugin "cluster-management" not found');
				}
			}

			if (pluginConfiguration.id === 'connections-rest-api' || pluginConfiguration.id === 'all') {
				try {
					pluginClass = require('../../../../plugins/connections-rest-api').Plugin;
					const requiredPluginObject = this._preprocessRequiredPlugin(pluginClass, pluginConfiguration);
					plugins.push(requiredPluginObject);
				} catch(error) {
					console.error('Plugin "connections-rest-api" not found');
				}
			}

			if (pluginConfiguration.id === 'custom-themes' || pluginConfiguration.id === 'all') {
				try {
					pluginClass = require('../../../../plugins/custom-themes').Plugin;
					const requiredPluginObject = this._preprocessRequiredPlugin(pluginClass, pluginConfiguration);
					plugins.push(requiredPluginObject);
				} catch(error) {
					console.error('Plugin "custom-themes" not found');
				}
			}

			if (pluginConfiguration.id === 'dynamic-security-rest-api' || pluginConfiguration.id === 'all') {
				try {
					pluginClass = require('../../../../plugins/dynamic-security-rest-api').Plugin;
					const requiredPluginObject = this._preprocessRequiredPlugin(pluginClass, pluginConfiguration);
					plugins.push(requiredPluginObject);
				} catch(error) {
					console.error('Plugin "dynamic-security-rest-api" not found');
				}
			}

			if (pluginConfiguration.id === 'https' || pluginConfiguration.id === 'all') {
				try {
					pluginClass = require('../../../../plugins/https').Plugin;
					const requiredPluginObject = this._preprocessRequiredPlugin(pluginClass, pluginConfiguration);
					plugins.push(requiredPluginObject);
				} catch(error) {
					console.error('Plugin "https" not found');
				}
			}

			// TODO: fix this plugin
			// if (pluginConfiguration.id === 'login-rate-limit' || pluginConfiguration.id === 'all') {
			// 	try {
			// 		pluginClass = require('../../../../plugins/login-rate-limit').Plugin;
			//      const requiredPluginObject = this._preprocessRequiredPlugin(pluginClass, pluginConfiguration);
			// 		plugins.push(requiredPluginObject);
			// 	} catch(error) {
			// 		console.error('Plugin "login-rate-limit" not found');
			// 	}
			// }

			if (pluginConfiguration.id === 'monitoring-rest-api' || pluginConfiguration.id === 'all') {
				try {
					pluginClass = require('../../../../plugins/monitoring-rest-api').Plugin;
					const requiredPluginObject = this._preprocessRequiredPlugin(pluginClass, pluginConfiguration);
					plugins.push(requiredPluginObject);
				} catch(error) {
					console.error('Plugin "monitoring-rest-api" not found');
				}
			}

			if (pluginConfiguration.id === 'multiple-connections' || pluginConfiguration.id === 'all') {
				try {
					pluginClass = require('../../../../plugins/multiple-connections').Plugin;
					const requiredPluginObject = this._preprocessRequiredPlugin(pluginClass, pluginConfiguration);
					plugins.push(requiredPluginObject);
				} catch(error) {
					console.error('Plugin "multiple-connections" not found');
				}
			}

			if (pluginConfiguration.id === 'saml-sso' || pluginConfiguration.id === 'all') {
				try {
					pluginClass = require('../../../../plugins/saml-sso').Plugin;
					const requiredPluginObject = this._preprocessRequiredPlugin(pluginClass, pluginConfiguration);
					plugins.push(requiredPluginObject);
				} catch(error) {
					console.error('Plugin "saml-sso" not found', error);
				}
			}
	
			if (pluginConfiguration.id === 'system-status-rest-api' || pluginConfiguration.id === 'all') {
				try {
					pluginClass = require('../../../../plugins/system-status-rest-api').Plugin;
					const requiredPluginObject = this._preprocessRequiredPlugin(pluginClass, pluginConfiguration);
					plugins.push(requiredPluginObject);
				} catch(error) {
					console.error('Plugin "system-status-rest-api" not found');
				}
			}

			if (pluginConfiguration.id === 'tls' || pluginConfiguration.id === 'all') {
				try {
					pluginClass = require('../../../../plugins/tls').Plugin;
					const requiredPluginObject = this._preprocessRequiredPlugin(pluginClass, pluginConfiguration);
					plugins.push(requiredPluginObject);
				} catch(error) {
					console.error('Plugin "tls" not found');
				}
			}

			if (pluginConfiguration.id === 'topictree-rest-api' || pluginConfiguration.id === 'all') {
				try {
					pluginClass = require('../../../../plugins/topictree-rest-api').Plugin;
					const requiredPluginObject = this._preprocessRequiredPlugin(pluginClass, pluginConfiguration);
					plugins.push(requiredPluginObject);
				} catch(error) {
					console.error('Plugin "topictree-rest-api" not found');
				}
			}

			if ((!CEDALO_MC_OFFLINE) && (pluginConfiguration.id === 'usage-analytics' || pluginConfiguration.id === 'all')) {
				try {
					pluginClass = require('../../../../plugins/usage-analytics').Plugin;
					const requiredPluginObject = this._preprocessRequiredPlugin(pluginClass, pluginConfiguration);
					plugins.push(requiredPluginObject);
				} catch(error) {
					console.error('Plugin "usage-analytics" not found');
				}
			}
	
			if (pluginConfiguration.id === 'user-management' || pluginConfiguration.id === 'all') {
				try {
					pluginClass = require('../../../../plugins/user-management').Plugin;
					const requiredPluginObject = this._preprocessRequiredPlugin(pluginClass, pluginConfiguration);
					plugins.push(requiredPluginObject);
				} catch(error) {
					console.error('Plugin "user-management" not found');
				}
			}

			if (pluginConfiguration.id === 'user-profile-edit' || pluginConfiguration.id === 'all') {
				try {
					pluginClass = require('../../../../plugins/user-profile-edit').Plugin;
					const requiredPluginObject = this._preprocessRequiredPlugin(pluginClass, pluginConfiguration);
					plugins.push(requiredPluginObject);
				} catch(error) {
					console.error('Plugin "user-profile-edit" not found');
				}
			}
		};


		if (!pluginList || !Array.isArray(pluginList)) { //  || pluginList.length === 0 if plugin list is null or undefined - everything from license is loaded. if plugin list is an empty list then no plugins are loaded
			load({id: 'all'}, plugins);
			return plugins;
		}

		for (const pluginConfiguration of pluginList) {
			if (!pluginConfiguration
				|| typeof pluginConfiguration !== 'object'
				|| !pluginConfiguration.id
				|| typeof pluginConfiguration.id !== 'string'
			) {
					throw new Error(`Plugin entry "${JSON.stringify(pluginConfiguration)}" in plugin config list is invalid`)
			}
			
			load(pluginConfiguration, plugins);
		}

		return plugins;
	}


	init(pluginList, context, swaggerDocument) {
		this._context = context;
		const { licenseContainer } = context;
		if (licenseContainer.license.isValid) {
			pluginList = removeDuplicates(pluginList, 'id');
			const allRequiredPlugins = this._requirePlugins(pluginList);

			allRequiredPlugins.forEach((requiredPlugin) => {
				const Plugin = requiredPlugin.Plugin;
				const shouldEnable = requiredPlugin.enable;
				const plugin = new Plugin({enableAtNextStartup: shouldEnable, context, hidden: false/*!!pluginConfiguration.hidden*/});
				if (licenseContainer.license.features &&
					licenseContainer.license.features.find(feature => plugin.meta.featureId === feature.name)
				) {
					if (!shouldEnable) {
						console.log(`Plugin not loaded: Plugin set to be disabled at current startup: "${plugin.meta.id}"`)
						plugin.setErrored(`Plugin set to be disabled at current startup: "${plugin.meta.id}"`);
						this._plugins.push(plugin);
					} else {
						this._plugins.push(plugin);
					}
				} else {
					console.log(`Plugin not loaded: License does not allow this plugin: "${plugin.meta.id}"`)
					plugin.setErrored(`License does not allow this plugin: "${plugin.meta.id}"`);
					this._plugins.push(plugin);
				}
			});
		} else {
			console.error('Ignore loading plugins: no premium license provided or license not valid');
		}

		this._loadOSPlugins(context);

		this._sortPluginList(this._plugins);

		this._plugins.forEach(plugin => {
			try {
				plugin.init(context);
				if (plugin.swagger) {
					swaggerDocument.tags = Object.assign(swaggerDocument.tags || {}, plugin.swagger.tags);
					swaggerDocument.paths = Object.assign(swaggerDocument.paths || {}, plugin.swagger.paths);
					swaggerDocument.components.schemas = Object.assign(swaggerDocument.components.schemas || {}, plugin.swagger.components?.schemas);
					swaggerDocument.components.statuses = Object.assign(swaggerDocument.components.statuses || {}, plugin.swagger.components?.statuses);
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

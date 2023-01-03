const path = require('path');
const low = require('lowdb');
const FileSync = require('lowdb/adapters/FileSync');
const { getBaseDirectory } = require('../utils/utils');

const adapter = new FileSync(path.join(process.env.CEDALO_MC_DIRECTORY_SETTINGS || getBaseDirectory(__dirname), 'settings.json'));
const db = low(adapter);

module.exports = class SettingsManager {
	constructor() {
		const defaultSettings = {
			allowTrackingUsageData: false,
			topicTreeEnabled: false
		};
		this.callbacks = [];
		db.defaults({
			settings: defaultSettings
		}).write();

		if (this.settings.topicTreeEnabled) {
			this.callToCallbacks(defaultSettings, this.settings);
		}
	}

	setCallback(brokerName, callback) {
		this.callbacks.push({brokerName, callback});
	}

	get settings() {
		return db.get('settings').value();
	}

	set settings(settings) {
		db.update('settings', (oldSettings) => settings).write();
	}

	callToCallbacks(oldSettings, newSettings) {
		this.callbacks.forEach(el => el.callback(oldSettings, newSettings));
	}

	updateSettings(settings, brokerName) {
		const oldSettings = this.settings;

		this.settings = settings;

		this.callToCallbacks(oldSettings, this.settings);
	}
};
// topicTreeEnabled
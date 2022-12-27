const path = require('path');
const low = require('lowdb');
const FileSync = require('lowdb/adapters/FileSync');

const adapter = new FileSync(path.join(process.env.CEDALO_MC_DIRECTORY_SETTINGS || __dirname, 'settings.json'));
const db = low(adapter);

module.exports = class SettingsManager {
	constructor(callback=() => {}) {
		this.callback = callback
		db.defaults({
			settings: {
				allowTrackingUsageData: false,
				topicTreeEnabled: false
			}
		}).write();
	}

	setCallback(callback) {
		this.callback = callback;
	}

	get settings() {
		return db.get('settings').value();
	}

	set settings(settings) {
		db.update('settings', (oldSettings) => settings).write();
	}

	updateSettings(settings) {
		const oldSettings = this.settings;

		this.settings = settings;

		this.callback(oldSettings, this.settings);
	}
};

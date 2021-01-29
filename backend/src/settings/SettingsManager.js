
const low = require('lowdb');
const FileSync = require('lowdb/adapters/FileSync');

const adapter = new FileSync('settings.json');
const db = low(adapter);
module.exports = class SettingsManager {
	constructor() {
		this.updateSettings({
			allowTrackingUsageData: false
		});
	}

	get settings() {
		return this._settings;
	}

	set settings(settings) {
		Object.assign(this._settings, settings);
	}

	updateSettings(settings) {
		this.settings = settings;
	}
};


const low = require('lowdb');
const FileSync = require('lowdb/adapters/FileSync');

const adapter = new FileSync('settings.json');
const db = low(adapter);
module.exports = class SettingsManager {
	constructor() {
		db.defaults({
			settings: {
				allowTrackingUsageData: false
			}
		}).write();
	}

	get settings() {
		return db.get('settings').value();
	}

	set settings(settings) {
		db.find('settings').assign(settings).write();
	}

	updateSettings(settings) {
		this.settings = settings;
	}
};

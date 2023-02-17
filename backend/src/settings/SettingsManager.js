const path = require('path');
const low = require('lowdb');
const FileSync = require('lowdb/adapters/FileSync');
const { getBaseDirectory } = require('../utils/utils');

const adapter = new FileSync(path.join(process.env.CEDALO_MC_DIRECTORY_SETTINGS || getBaseDirectory(__dirname), 'settings.json'));
const db = low(adapter);

module.exports = class SettingsManager {
	constructor(context) {
		this._context = context;
		const defaultSettings = {
			allowTrackingUsageData: false,
			topicTreeEnabled: false
		};
		db.defaults({
			settings: defaultSettings
		}).write();
	}

	get settings() {
		return db.get('settings').value();
	}

	set settings(settings) {
		db.update('settings', (oldSettings) => settings).write();
	}

	updateSettings(settings, brokerName) {
		const oldSettings = this.settings;

		this.settings = settings;

		this._context?.eventEmitter?.emit('settings-update', oldSettings, this.settings);
	}
};
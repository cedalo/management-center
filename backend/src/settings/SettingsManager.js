
module.exports = class SettingsManager {
	constructor() {
		this._settings = {
			allowTrackingUsageData: false
		};
	}

	get settings() {
		return this._settings;
	}
};

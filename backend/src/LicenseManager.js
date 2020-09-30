module.exports = class LicenseManager {
	constructor() {
		this._license = {
			version: 'pro',
		};
	}

	get license() {
		return this._license;
	}
}
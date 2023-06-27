const devFeatures = (() => {
	try {
		return require(process.env.CEDALO_MC_DEV_FEATURES_FILE);
	} catch (_) { /* ignore */ }
	return [];
})();

// DEV PURPOSE ONLY
class LicenseContainer {
	constructor() {
		this._license;
	}
	get license() {
		return this._license;
	}
	set license(license) {
		license.features?.splice(license.features.length, 0, ...devFeatures);
		this._license = license;
	}
}
const licenseContainer = new LicenseContainer();
module.exports = licenseContainer;

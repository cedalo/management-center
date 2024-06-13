const devFeatures = (() => {
	try {
		const features = require(process.env.CEDALO_MC_DEV_FEATURES_FILE);
		return (typeof features === 'object' && Object.keys(features).length === 0) ? [] : features;
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
		license?.features?.splice(license.features.length, 0, ...devFeatures);
		this._license = license;
	}
}
const licenseContainer = new LicenseContainer();
module.exports = licenseContainer;

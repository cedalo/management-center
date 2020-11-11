const path = require('path');

const License = require('../License');
const LicenseKey = require('../LicenseKey');
const readFile = require('./readFile');

const loadPublicKey = () =>
	readFile(process.env.MOSQUITTO_UI_LICENSE_PUBLIC_KEY_PATH || path.join(__dirname, 'config', 'public.pem'));
const loadLicenseKey = () =>
	readFile(process.env.MOSQUITTO_UI_LICENSE_PATH || path.join(__dirname, 'config', 'license.lic')).then((key) =>
		key.toString()
	);

const loadLicense = async () => {
	let license;
	try {
		const publicKey = await loadPublicKey();
		const licenseKey = await loadLicenseKey();
		license = LicenseKey.verify(licenseKey, publicKey);
	} catch (error) {
		console.error(error);
		console.error(__dirname);
		console.error(process.env.MOSQUITTO_UI_LICENSE_PATH)
		license = License.Invalid;
	}
	return license;
};

module.exports = loadLicense;

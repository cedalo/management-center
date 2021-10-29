const path = require('path');

const License = require('../License');
const LicenseKey = require('../LicenseKey');
const readFile = require('./readFile');

const loadPublicKey = () =>
	readFile(process.env.CEDALO_MC_LICENSE_PUBLIC_KEY_PATH || path.join(__dirname, 'config', 'public.pem'));
const loadLicenseKey = () =>
	readFile(process.env.CEDALO_MC_LICENSE_PATH || path.join(__dirname, 'config', 'license.lic'))
	.then((key) =>
		key.toString().trim()
	)
	.catch((error) => {
		console.log('No license key found or provided.');
		throw error;
	})

const loadLicense = async () => {
	let license;
	try {
		const publicKey = await loadPublicKey();
		const licenseKey = await loadLicenseKey();
		license = LicenseKey.verify(licenseKey, publicKey);
	} catch (error) {
		license = License.Invalid;
	}
	return license;
};

module.exports = loadLicense;

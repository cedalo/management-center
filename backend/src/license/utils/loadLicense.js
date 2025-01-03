const path = require('path');

const License = require('../License');
const LicenseKey = require('../LicenseKey');
const readFile = require('./readFile');

let loaded = false;

const loadPublicKey = () =>
    readFile(process.env.CEDALO_MC_LICENSE_PUBLIC_KEY_PATH || path.join(__dirname, 'config', 'public.pem'));
const loadLicenseKey = () => {
    if (process.env.CEDALO_LICENSE_KEY) {
        const licenseString = process.env.CEDALO_LICENSE_KEY;
        return Promise.resolve(licenseString.trim());
    } else {
        const licensePath =
            process.env.CEDALO_LICENSE_FILE ||
            process.env.CEDALO_MC_LICENSE_PATH ||
            path.join(__dirname, 'config', 'license.lic');
        if (!loaded) {
            console.log(`Loading license from ${licensePath} ...`);
        }
        return readFile(licensePath)
            .then((key) => key.toString().trim())
            .catch((error) => {
                console.log('No license key found or provided.');
                throw error;
            })
            .finally(() => {
                loaded = true;
            });
    }
};

const loadLicense = async () => {
    let license;
    try {
        const publicKey = await loadPublicKey();
        const licenseKey = await loadLicenseKey();
        license = await LicenseKey.verify(licenseKey, publicKey);
    } catch (error) {
        console.error(error);
        license = License.Invalid;
    }
    return license;
};

module.exports = loadLicense;

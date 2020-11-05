const jwt = require('jsonwebtoken');
const License = require('./License');
const readFile = require('./utils/readFile');

const generate = (license, privateKey) =>
	new Promise((resolve, reject) => {
		if (!(license instanceof License)) reject(new Error('Invalid license object!'));
		jwt.sign(license.toJSON(), privateKey, { algorithm: 'RS256' }, (err, token) => {
			if (err) reject(err);
			else resolve(token);
		});
	});
// TODO rename:
const generateWithKeyFile = (license, filename) =>
	readFile(filename).then((privateKey) => generate(license, privateKey));

const verify = (licenseKey, publicKey) =>
	new Promise((resolve, reject) => {
		jwt.verify(licenseKey, publicKey, { algorithm: 'RS256' }, (err, json) =>
			err ? reject(err) : resolve(License.from(json))
		);
	});
// TODO rename:
const verifyLicenseKeyFile = async (licenseFile, keyFile) => {
	const publicKey = await readFile(keyFile);
	const licenseKey = await readFile(licenseFile);
	return verify(licenseKey.toString(), publicKey);
};

module.exports = {
	generate,
	generateWithKeyFile,
	verify,
	verifyLicenseKeyFile
};

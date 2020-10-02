const fs = require('fs');
const jwt = require('jsonwebtoken');
const later = require('later');
const License = require('./License');

module.exports = class LicenseManager {
	constructor(config) {
		this._license = null;
		this._licenseTimer = null;
	}

	getLicenseAsJSON() {
		return this._license ? this._license.toJSON() : { error: License.ERRORS.LICENSE_ERROR};
	}

	/**
	 * Hook for testing is license is valid. If return false this will stop all services
	 * @param license: License
	 * @returns {boolean}
	 */
	validateLicense(license) {
		return true;
	}

	static async parseLicenseKey(token, publicKey) {
		return new Promise((resolve, reject) => {
			jwt.verify(
				token,
				publicKey,
				{ algorithm: 'RS256' },
				(err, decoded) => {
					if (err) {
						return reject(err);
					}
					return resolve(decoded);
				}
			);
		});
	}

	scheduleLicenseCheck() {
		const validTillDate = this._license.validTillDate;
		const hh = validTillDate.getHours();
		const mm = validTillDate.getMinutes() + 1;
		const cron = `${mm} ${hh} * * *`;
		const textSched = later.parse.cron(cron);
		this._licenseTimer = later.setInterval(
			this.assertLicenseValid.bind(this),
			textSched
		);
	}

	assertLicenseValid(license = this._license) {
		this.validateLicense(license);
		if (license.error) {
			if(this._licenseTimer) {
				this._licenseTimer.clear();
			}
			throw new Error(license.error);
		}
		this._license = license;
	}

	async loadLicense() {
		if (this._license) {
			return this._license;
		}
		let licenseKey = process.env.STREAMSHEETS_LICENSE;
		const publicKeyPath =
			process.env.STREAMSHEETS_LICENSE_PUBLIC_KEY_PATH ||
			'config/cedalo.key.pub';
		const lpath =
			process.env.STREAMSHEETS_LICENSE_FILE_PATH || 'license/license.lic';
		try {
			const publicKey = fs.readFileSync(publicKeyPath);
			if (
				typeof licenseKey !== 'string' ||
				licenseKey.trim().length < 1
			) {
				licenseKey = fs
				.readFileSync(lpath)
				.toString()
				.trim();
			}
			if(typeof licenseKey === 'string' && licenseKey.length>0) {
				const licenseObj = await LicenseManager.parseLicenseKey(
					licenseKey,
					publicKey
				);
				const license = new License(licenseObj);
				this.assertLicenseValid(license);
				this.scheduleLicenseCheck();
			} else {
				this._license = License.NoLicense();
			}

		} catch (e) {
			this._license = License.NoLicense();
		}
		return this._license;
	}

};

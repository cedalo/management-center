const axios = require('axios');

const URL = 'https://api.cedalo.cloud/rest/request/mosquitto-ui/installation';

module.exports = class InstallationManager {
	constructor({ license, version, installation }) {
		this._license = license;
		this._version = version;
		this._installation = installation;
	}

	async send(data) {
		const sendData = {
			installation: this._installation,
			license: this._license,
			timestamp: Date.now(),
			version: this._version,
		};
		try {
			const response = await axios.post(URL, sendData);
			return response;
		} catch (error) {
			console.error(error);
		}
	}

	async verifyLicense() {
		const response = await this.send();
	}
};

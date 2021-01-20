const axios = require('axios');

const URL = 'https://api.cedalo.cloud/rest/request/mosquitto-ui/usage';

module.exports = class UsageTracker {
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
			...data
		};
		try {
			const response = await axios.post(URL, sendData);
		} catch (error) {
			console.error(error);
		}
	}

	async init() {
		
	}
};

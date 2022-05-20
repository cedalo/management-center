const HTTPClient = require('../http/HTTPClient');

const URL = 'https://api.cedalo.cloud/rest/request/mosquitto-ui/usage';
const CEDALO_MC_OFFLINE = process.env.CEDALO_MC_MODE === 'offline';

module.exports = class UsageTracker {
	constructor({ license, version, installation }) {
		this._license = license;
		this._version = version;
		this._installation = installation;
	}

	async send(data) {
		if (!CEDALO_MC_OFFLINE) {
			const sendData = {
				installation: this._installation,
				license: this._license,
				timestamp: Date.now(),
				version: this._version,
				...data
			};
			try {
				const response = await HTTPClient.getInstance().post(URL, sendData);
			} catch (error) {
				console.error(error);
			}
		}
	}

	async init() {
		
	}
};

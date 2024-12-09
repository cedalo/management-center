const HTTPClient = require('../http/HTTPClient');

const URL = 'https://api.cedalo.cloud/rest/request/mosquitto-ui/installation';
const CEDALO_MC_OFFLINE = process.env.CEDALO_MC_MODE === 'offline';

module.exports = class InstallationManager {
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
            };
            try {
                const response = await HTTPClient.getInstance().post(URL, sendData);
                return response;
            } catch (error) {
                console.error(error);
            }
        }
    }

    async verifyLicense() {
        const response = await this.send();
    }
};

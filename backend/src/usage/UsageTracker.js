const axios = require("axios");

const URL = "https://api.cedalo.cloud/rest/request/mosquitto-ui/usage";

module.exports = class UsageTracker {
  constructor({ license, version }) {
    this._license = license;
    this._version = version;
  }

  async send(data) {
    const sendData = {
      license: this._license,
      timestamp: Date.now(),
      version: this._version,
      ...data,
    };
    try {
      const response = await axios.post(URL, sendData);
    } catch (error) {
      console.error(error);
    }
  }
};

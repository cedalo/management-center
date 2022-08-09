const os = require('os');
const urlModule = require('url');
const axios = require('axios');

const version = require('../utils/version');

const CONFIG = {};

class HTTPClient {

	constructor(config) {
		this._init(config);
	}

	_init(config) {
	}

	_checkConfig(config) {
		if (!config.headers) {
			config.headers = {};
		}
		if (!config.headers['User-Agent']) {
			config.headers['User-Agent'] = `${version.name}/${version.version} (${os.platform()} ${os.release()})`;
		}
		return config;
	}

	async request(body, headers, config = {}) {
		config.data = body;
		config.headers = headers;
		config = this._checkConfig(config);
		return axios.request(config)
	}

	async get(url, headers, config = {}) {
		config.headers = headers;
		config = this._checkConfig(config);
		return axios.get(url, config)
	}

	async delete(url, headers, config = {}) {
		config.headers = headers;
		config = this._checkConfig(config);
		return axios.delete(url, config)
	}

	async head(url, headers, config = {}) {
		config.headers = headers;
		config = this._checkConfig(config);
		return axios.head(url, config)
	}

	async options(url, headers, config = {}) {
		config.headers = headers;
		config = this._checkConfig(config);
		return axios.options(url, config)
	}

	async post(url, body, headers = {}, config = {}) {
		config.headers = headers;
		config = this._checkConfig(config);
		if (headers['Content-Type'] && headers['Content-Type'] === 'application/x-www-form-urlencoded') {
			const formParams = {
				...body
			}
			try {
				const params = new urlModule.URLSearchParams(formParams);
				return axios.post(url, params.toString(), config);
			} catch (error) {
				console.error(error);
			}
		}
		return axios.post(url, body, config);
	}

	async put(url, body, headers, config = {}) {
		config.headers = headers;
		config = this._checkConfig(config);
		return axios.put(url, body, config)
	}

	async patch(url, body, headers, config = {}) {
		config.headers = headers;
		config = this._checkConfig(config);
		return axios.patch(url, body, config)
	}

}

let instance;
const getInstance = () => {
	if (!instance) {
		instance = new HTTPClient(CONFIG);
	}
	return instance;
};

module.exports = {
	getInstance
};

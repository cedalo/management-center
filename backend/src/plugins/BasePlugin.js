const winston = require('winston');

const STATUS_ERROR = 'error';
const STATUS_UNLOADED = 'unloaded';
const STATUS_LOADED = 'loaded';

module.exports = class BasePlugin {
	constructor(meta) {
		this._status = {
			type: STATUS_UNLOADED
		};
		const logger = winston.createLogger({
			level: 'info',
			format: winston.format.json(),
			defaultMeta: { service: meta?.name },
			transports: [
			  new winston.transports.File({ filename: `plugin-${meta?.id}.log` }),
			],
		  });
		this._logger = logger;
		this._swagger = {};
	}

	get logger() {
		return this._logger;
	}

	unload(context) {
		this.setUnloaded();
	}

	load(context) {
		this.setLoaded();
	}

	isLoaded() {
		return this._status.type === STATUS_LOADED;
	}

	setLoaded() {
		this._status = {
			type: STATUS_LOADED
		};
	}

	setUnloaded() {
		this._status = {
			type: STATUS_UNLOADED,
			message: 'Plugin not enabled'
		};
	}

	setErrored(error) {
		this._status = {
			type: STATUS_ERROR,
			message: error
		};
	}

	get status() {
		return this._status;
	}

	get swagger() {
		return this._swagger;
	}
}

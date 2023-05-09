const path = require('path');
const winston = require('winston');

const STATUS_ERROR = 'error';
const STATUS_UNLOADED = 'unloaded';
const STATUS_LOADED = 'loaded';

const LOG_DIR = process.env.CEDALO_MC_LOG_DIR || '';

module.exports = class BasePlugin {
	constructor(meta, options) {
		this._status = {
			type: STATUS_UNLOADED
		};
		const logger = winston.createLogger({
			level: 'info',
			format: winston.format.json(),
			defaultMeta: { service: meta?.name },
			transports: [new winston.transports.File({ filename: path.join(LOG_DIR, `plugin-${meta?.id}.log`) })]
		});
		this._meta = meta;
		this._logger = logger;
		this._swagger = {};
		this.options = {};

		if (!options) {
			return;
		} else if (!(typeof option === 'object' && option !== null)) {
			throw new Error('options argument passed to BasePlugin is not of type "Object"');
		}
		for (const option in options) {
			this.options[option] = options[option];
		}
	}

	get logger() {
		return this._logger;
	}


	get meta() {
		return this._meta;
	}

	get featureId() {
		return this.meta.featureId;
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
};

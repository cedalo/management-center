const STATUS_ERROR = 'error';
const STATUS_UNLOADED = 'unloaded';
const STATUS_LOADED = 'loaded';

module.exports = class BasePlugin {
	constructor() {
		this._status = {
			type: STATUS_UNLOADED
		};
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
}

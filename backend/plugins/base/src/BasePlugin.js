module.exports = class BasePlugin {
	constructor() {
		this._status = 'unloaded';
	}

	isLoaded() {
		return this._status === 'loaded';
	}

	setLoaded() {
		this._status = 'loaded';
	}

	setUnloaded() {
		this._status = 'unloaded';
	}

	setErrored() {
		this._status = 'errored';
	}

	get status() {
		return this._status;
	}
}

const cron = require('node-cron');
const loadLicense = require('./utils/loadLicense');

const noop = () => {};
const pipe = (...fns) => (val) => fns.reduce((p, fn) => p.then(fn), Promise.resolve(val));

const toDate = (ms) => new Date(ms);
const toCronTab = (date) => `${date.getMinutes()} ${date.getHours()} * * *`;
const msToCronTab = pipe(toDate, toCronTab);
const valideCronTab = (crontab) => {
	if (crontab && !cron.validate(crontab)) {
		crontab = undefined;
	}
	return crontab;
};
const getCronTab = async (crontab, license) => valideCronTab(crontab) || msToCronTab(license.validUntil);

const notify = (cb) => (license) => {
	cb(null, license);
	return license;
}

class LicenseChecker {
	constructor() {
		this._task = undefined;
	}

	async check(cb = noop) {
		this.checkLicense(cb)();
	}

	checkLicense(cb) {
		return pipe(loadLicense, notify(cb));
	}

	async schedule(cb = noop) {
		this.scheduleEvery('', cb);
	}

	async scheduleEvery(crontab = '', cb = noop) {
		if (!this._task) {
			const check = this.checkLicense(cb);
			const license = await check();
			const every = await getCronTab(crontab, license);
			this._task = cron.schedule(every, check);
		}
	}

	stop() {
		if (this._task) {
			this._task.stop();
			this._task = undefined;
		}
	}
}

// new LicenseChecker().check((license) => console.log(`License is valid: ${license.isValid}`));

module.exports = LicenseChecker;

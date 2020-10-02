const ERRORS = {
	LICENSE_ERROR_UNKNOWN : 'LICENSE_ERROR_UNKNOWN',
	LICENSE_ERROR_PERIOD_INVALID : 'LICENSE_ERROR_PERIOD_INVALID',
	LICENSE_ERROR_EXPIRED : 'LICENSE_ERROR_EXPIRED',
	LICENSE_ERROR_MAX_STREAMS : 'LICENSE_ERROR_MAX_STREAMS',
	LICENSE_ERROR_MAX_CONNECTORS : 'LICENSE_ERROR_MAX_CONNECTORS',
	LICENSE_ERROR_MAX_CONSUMERS : 'LICENSE_ERROR_MAX_CONSUMERS',
	LICENSE_ERROR_MAX_PRODUCERS : 'LICENSE_ERROR_MAX_PRODUCERS',
	LICENSE_ERROR_MAX_USERS : 'LICENSE_ERROR_MAX_USERS',
	LICENSE_ERROR_MAX_MACHINES : 'LICENSE_ERROR_MAX_MACHINES',
};

class License {
	constructor(config = {}) {
		this.issuedBy = 'Cedalo AG';
		this.issuedTo = config.issuedTo || 'Anonymous';
		this.error = config.error;
		this.edition = config.edition || 'dev';
		this.refId = config.refId || 'NO_REF';
		this.maxNoOfStreams = typeof config.maxNoOfStreams !== 'undefined' ? config.maxNoOfStreams : -1;
		this.maxNoOfConnectors = typeof config.maxNoOfConnectors !== 'undefined' ? config.maxNoOfConnectors : -1;
		this.maxNoOfProducers = typeof config.maxNoOfProducers !== 'undefined' ? config.maxNoOfProducers : -1;
		this.maxNoOfConsumers = typeof config.maxNoOfConsumers !== 'undefined' ? config.maxNoOfConsumers : -1;
		this.maxNoOfUsers = typeof config.maxNoOfUsers !== 'undefined' ? config.maxNoOfUsers : -1;
		this.maxNoOfMachines = typeof config.maxNoOfMachines !== 'undefined' ? config.maxNoOfMachines :  -1;
		this.maxNoOfSheets = typeof config.maxNoOfSheets !== 'undefined' ? config.maxNoOfSheets :  -1;
		this.maxNoOfMachinesInstances = typeof config.maxNoOfMachinesInstances !== 'undefined' ? config.maxNoOfMachinesInstances :  -1;
		this.maxNoOfInstallations = typeof config.maxNoOfInstallations !== 'undefined' ? config.maxNoOfInstallations :  -1;
		if (!isNaN(Date.parse(config.validSinceDate))) {
			this.validSinceDate = new Date(config.validSinceDate);
		} else {
			this.validSinceDate = new Date();
		}
		if (!isNaN(Date.parse(config.validTillDate))) {
			this.validTillDate = new Date(config.validTillDate);
		} else {
			this.validTillDate = new Date();
		}
		this.allowedFeatures = config.allowedFeatures || [];
		this.allowedStreams = config.allowedStreams || [];
	}

	toJSON() {
		return {
			error: this.error,
			refId: this.refId,
			edition: this.edition,
			issuedBy: this.issuedBy,
			issuedTo: this.issuedTo,
			maxNoOfUsers: this.maxNoOfUsers,
			maxNoOfMachines: this.maxNoOfMachines,
			maxNoOfStreams: this.maxNoOfStreams,
			maxNoOfConnectors: this.maxNoOfConnectors,
			maxNoOfProducers: this.maxNoOfProducers,
			maxNoOfConsumers: this.maxNoOfConsumers,
			maxNoOfSheets: this.maxNoOfSheets,
			maxNoOfMachinesInstances: this.maxNoOfMachinesInstances,
			maxNoOfInstallations: this.maxNoOfInstallations,
			validSinceDate: this.validSinceDate.toISOString(),
			validTillDate: this.validTillDate.toISOString(),
			allowedFeatures: this.allowedFeatures,
			allowedStreams: this.allowedStreams,
		};
	}

	toString() {
		return JSON.stringify(this.toJSON());
	}

	hasExpired() {
		const now = new Date();
		return now > this.validTillDate;
	}

	static NoLicense(e) {
		const now = new Date();
		return new License({
			error: e ? e.message || e : undefined,
			edition: '',
			maxNoOfUsers: 0,
			maxNoOfMachines: 0,
			maxNoOfStreams: 0,
			maxNoOfConnectors: 0,
			maxNoOfProducers: 0,
			maxNoOfConsumers: 0,
			maxNoOfSheets: 0,
			maxNoOfMachinesInstances: 0,
			maxNoOfInstallations: 0,
			validSinceDate: now.toISOString(),
			validTillDate: now.toISOString(),
			allowedFeatures: [],
			allowedStreams: [],
		});
	}

	static UnlimitedLicense() {
		const now = new Date();
		const ever = new Date('2100-12-1');
		return new License({
			edition: 'pro',
			maxNoOfUsers: -1,
			maxNoOfMachines: -1,
			maxNoOfStreams: -1,
			maxNoOfConnectors: -1,
			maxNoOfProducers: -1,
			maxNoOfConsumers: -1,
			maxNoOfSheets: -1,
			maxNoOfMachinesInstances: -1,
			maxNoOfInstallations: -1,
			validSinceDate: now.toISOString(),
			validTillDate: ever.toISOString(),
			allowedFeatures: [],
			allowedStreams: [],
		});
	}

	validate() {
		const now = new Date();
		if(now < this.validSinceDate || this.validSinceDate > this.validTillDate) {
			this.error = ERRORS.LICENSE_ERROR_PERIOD_INVALID
		}
		if(this.hasExpired()) {
			this.error = License.ERRORS.LICENSE_ERROR_EXPIRED
		}
		return !!this.error;
	}

}

License.ERRORS = ERRORS;

module.exports = License;

class License {
    static _setup(license, json) {
        return Object.entries(json).reduce((lic, [key, value]) => {
            if (value != null) lic[key] = value;
            return lic;
        }, license);
    }

    static _validate(license) {
        return Object.entries(license).reduce(
            (err, [key, value]) => err || (value == null ? `${key} not specified!` : undefined),
            undefined
        );
    }

    static from(json = {}) {
        // const license = Object.assign(new License(), DEF, json);
        const license = License._setup(new License(), json);
        const error = License._validate(license);
        if (error) throw Error(error);
        return Object.freeze(license);
    }

    constructor() {
        this.edition = 'Personal';
        this.issuedBy = 'Cedalo AG';
        this.issuedTo = undefined;
        this.maxInstallations = -1;
        this.maxBrokerConnections = 1;
        this.validSince = Date.now();
        this.validUntil = undefined;
    }

    toJSON() {
        return Object.assign({}, this);
    }

    get isValid() {
        const now = Date.now();
        return this.validSince <= now && now <= this.validUntil;
    }

    // expiresIn() {
    // 	return this.validUntil - Date.now();
    // }
}

class InvalidLicense extends License {
    constructor() {
        super();
        this.validUntil = Date.now();
    }

    get isValid() {
        return false;
    }
}

License.Invalid = Object.freeze(new InvalidLicense());

module.exports = License;

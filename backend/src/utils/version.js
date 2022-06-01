const { v4: uuidv4 } = require('uuid');

const packageJSON = require('../../package.json');

const version = {
	name: process.env.CEDALO_MC_NAME || 'Cedalo Management Center',
	version: process.env.CEDALO_MC_VERSION || packageJSON.version,
	buildNumber: process.env.TRAVIS_BUILD_NUMBER || process.env.CEDALO_MC_BUILD_NUMBER || uuidv4(),
	buildDate: process.env.CEDALO_MC_BUILD_DATE || Date.now()
};

module.exports = version;
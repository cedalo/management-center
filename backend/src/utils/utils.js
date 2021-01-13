const fs = require('fs');
const path = require('path');
const { v4: uuidv4 } = require('uuid');

const initId = () => {
	const id = uuidv4();
	return {
		id,
		created: Date.now()
	} 
}

const loadInstallation = () => {
	const installationFile = '../../../config/installation.json';
	let installation;
	if (fs.existsSync(path.resolve(__dirname, installationFile))) {
		try {
			installation = JSON.parse(fs.readFileSync(path.resolve(__dirname, installationFile)).toString());
		} catch (error) {
			installation = initId();
			fs.writeFileSync(path.resolve(__dirname, installationFile), JSON.stringify(installation, null, 2));
		}
	} else {
		installation = initId();
		fs.writeFileSync(path.resolve(__dirname, installationFile), JSON.stringify(installation, null, 2));
	}
	return installation;
}

module.exports = {
	loadInstallation
};

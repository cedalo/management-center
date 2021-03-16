const fs = require('fs');
const path = require('path');
const { v4: uuidv4 } = require('uuid');
const low = require('lowdb');
const FileSync = require('lowdb/adapters/FileSync');

const adapter = new FileSync(path.join(process.env.CEDALO_MC_DIRECTORY_SETTINGS || __dirname, 'db.json'));
const db = low(adapter);

const initId = () => {
	const id = 	uuidv4();
	return {
		id,
		created: Date.now()
	} 
}

const loadInstallation = () => {
	db.defaults({
		install: initId()
	}).write();
	const installation = db.get('install').value();
	return installation;
}

module.exports = {
	loadInstallation
};

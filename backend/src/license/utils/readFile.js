const fs = require('fs');
// until we can finally use: const fs = require('fs').promises;

const read = (file) =>
	new Promise((resolve, reject) => fs.readFile(file, (err, data) => (err ? reject(err) : resolve(data))));

const fileExists = (filename = '') =>
	new Promise((resolve, reject) => {
		if (!filename) reject(new Error('Please specify a file name to load!'));
		fs.access(filename, (err) => (err ? reject(err) : resolve(filename)));
	});

module.exports = (file) => fileExists(file).then(read);

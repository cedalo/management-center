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


const reverseMap = (map) => {
	const reversedMap = new Map();

	for (const [key, value] of map) {
		reversedMap.set(value, key);
	}

	return reversedMap;
};







const getCircularReplacer = () => {
    const seen = new WeakMap();
    return (key, property) => {
        if (typeof property !== 'object' || property === null) {
            return property;	
        } else if (seen.has(property)) {
            return `[Circular of ${seen.get(property)}]`;
        } else {
            seen.set(property, key);
            return property;
        }
    }
}

const iterateObject = (key, object, processor) => {
    if (typeof object !== 'object' || object === null) {
        return object;
    }

    object = processor(key, object);

    for (const key in object) {
        if (!object.hasOwnProperty(key)) {
            continue;
        }
        object[key] = iterateObject(key, object[key], processor);
    }

    return object;
}


const removeCircular = (object) => {
    const circularReplacer = getCircularReplacer();

    object = iterateObject('root', object, circularReplacer);

    return object;
}




module.exports = {
	loadInstallation,
	reverseMap,
	removeCircular,
};

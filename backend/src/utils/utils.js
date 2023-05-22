const path = require('path');
const { v4: uuidv4 } = require('uuid');
const low = require('lowdb');
const FileSync = require('lowdb/adapters/FileSync');
const crypto = require('crypto');

const sessions = require('./sessions');


const getBaseDirectory = (dirname) => {
	if (process.env.CEDALO_MC_DATA_DIRECTORY_PATH) {
		return process.env.CEDALO_MC_DATA_DIRECTORY_PATH;
	}
	
	// if (dirname.includes('snapshot')) { // for packaged executables
	// 	if (process.env.CEDALO_MC_DIRECTORY_SETTINGS) {
	// 		return process.env.CEDALO_MC_DIRECTORY_SETTINGS; // will be trying to save everything in this directory in case of packaged executables
	// 	} else {
	// 		return process.cwd();
	// 	}
	// }
	return dirname;
};


const adapter = new FileSync(path.join(process.env.CEDALO_MC_DIRECTORY_SETTINGS || getBaseDirectory(__dirname), 'db.json'));
const db = low(adapter);


const initId = () => {
	const id = 	uuidv4();
	return {
		id,
		created: Date.now()
	} 
};


const loadInstallation = () => {
	db.defaults({
		install: initId()
	}).write();
	const installation = db.get('install').value();
	return installation;
};



const stripConnectionsCredentials = (connections, user, context, customAuthorizationFunction) => {
    return connections.map(connection => {
        const authorizationFunction = customAuthorizationFunction || context.security.acl.atLeastAdmin;
        if (context.security.acl.isConnectionAuthorized(user, authorizationFunction, connection.name)) {
            return connection;
        } else {
            const connectionCopy = Object.assign({}, connection);
            delete connectionCopy.credentials;
            return connectionCopy;
        }
    });
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
            return property; // ensured it's an object
        }
    }
};


const iterateObject = (key, object, processor) => {
    if (typeof object !== 'object' || object === null) {
        return object;
    }

    object = processor(key, object);

    if (typeof object !== 'object') {
        return object;
    }

    for (const key in object) {
        if (!Object.prototype.hasOwnProperty.call(object, key)) {
            continue;
        }
        object[key] = iterateObject(key, object[key], processor);
    }

    return object;
};


const removeCircular = (object) => {
    const circularReplacer = getCircularReplacer();

    object = iterateObject('root', object, circularReplacer);

    return object;
};


const stringToBool = (string) => {
    return (string === 'true');
};


const generateSecret = () => { // TODO: change the location of this fucntion, also use it in plugins' secret generator, or transfer secretGenerator code here
    return crypto.randomBytes(64).toString('hex');
};


const embedIntoObject = (object, embeddings) => {
    // mutates the object by adding new properties to it
    for (const key in embeddings) {
        const value = embeddings[key];
        object[key] =  value;
    }
    return object;
};



module.exports = {
	loadInstallation,
	removeCircular,
    stringToBool,
    getBaseDirectory,
    stripConnectionsCredentials,
    generateSecret,
    embedIntoObject,
    ...sessions
};

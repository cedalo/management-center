import React, { createContext } from 'react';
import {
	updateLicenseStatus,
	updateBrokerConfigurations,
	updateBrokerConnected,
	updateBrokerConnections,
	updateProxyConnected,
	updateClients,
	updateClientsAll,
	updateWebSocketClients,
	updateWebSocketClientConnected,
	updateWebSocketClientDisconnected,
	updateAnonymousGroup,
	updateGroups,
	updateGroupsAll,
	updateLicense,
	updateDefaultACLAccess,
	updateRoles,
	updateRolesAll,
	updateSettings,
	updateStreams,
	updateSystemStatus,
	updateTopicTree,
	updateVersion,
	updateEditDefaultClient,
	updateFeatures,
	updateUserProfile,
	updateBrokerLicenseInformation,
	updateTests,
	updateTestCollections,
	updateApplicationTokens,
	updateLoading,
	updateBackendParameters
} from '../actions/actions';

import {
	updateUserRoles,
	updateUsers,
	updateUserGroups,
} from '../admin/users/actions/actions';

import {
	updateClusters,
	updateClusterDetails
} from '../admin/clusters/actions/actions';

import {
	updateInspectClients
} from '../admin/inspect/actions/actions';

import WS_BASE from './config';
import WebMosquittoProxyClient from '../client/WebMosquittoProxyClient';
import { useDispatch, useSelector } from 'react-redux';

const WebSocketContext = createContext(null);

export { WebSocketContext };

const ERROR_MESSAGE = "BaseMosquittoProxyClient: Timeout";


let ws;
let currentConnectionName;


const init = async (client, dispatch, connectionConfiguration) => {
	dispatch(updateBrokerLicenseInformation(null));
	dispatch(updateInspectClients([]));
	dispatch(updateClients([]));
	dispatch(updateClientsAll([]));
	dispatch(updateGroups([]));
	dispatch(updateGroupsAll([]));
	dispatch(updateUserGroups({}));
	dispatch(updateRoles([]));
	dispatch(updateRolesAll([]));
	dispatch(updateStreams([]));
	dispatch(updateSystemStatus({}));
	dispatch(updateBackendParameters({}));
	dispatch(updateApplicationTokens([]));
	dispatch(updateUserRoles([]));

	// TODO: merge with code from BrokerSelect
	await client.connect(connectionConfiguration)
	dispatch(updateProxyConnected(true));

	let userProfile;
	try {
		userProfile = await client.getUserProfile();
		dispatch(updateUserProfile(userProfile));
		const userRoles = await client.listUserRoles();
		dispatch(updateUserRoles(userRoles));
		const users = await client.listUsers();

		if (!Array.isArray(users)) {
			throw {name: 'NotAuthorizedError', message: 'Usermanagement is not accessible'}
		} 
		
		dispatch(updateUsers(users));
		
		dispatch(updateFeatures({
			feature: 'usermanagement',
			status: 'ok'
		}));
	} catch (error) {
		dispatch(updateFeatures({
			feature: 'usermanagement',
			status: 'failed',
			error
		}));
	}


	try {
		const backendParameters = await client.getBackendParameters();
		dispatch(updateBackendParameters(backendParameters));
	} catch (error) {
		console.error('backendParameters could not be fetched. Reason:', error);
	}


	try {
		const tokens = await client.listApplicationTokens();
		
		if (!Array.isArray(tokens)) {
			dispatch(updateFeatures({
				feature: 'applicationtokens',
				status: 'failed',
				error: 'Not found'
			}));
		} else {
			console.log('App tokens are disabled')
			dispatch(updateApplicationTokens(tokens));
			dispatch(updateFeatures({
				feature: 'applicationtokens',
				status: 'ok'
			}));
		}
	} catch (error) {
		console.log('App tokens failed with error:', error);
		dispatch(updateFeatures({
			feature: 'applicationtokens',
			status: 'failed',
			error
		}));
	}


	try {
		const isEnabled = await client.checkTopictreeRestEnabled();
		if (isEnabled) {
			dispatch(updateFeatures({
				feature: 'topictreerest',
				status: 'ok'
			}));
		} else {
			console.log('Topic tree REST is disabled');
			dispatch(updateFeatures({
				feature: 'topictreerest',
				status: {message: ERROR_MESSAGE, status: 'failed'},
				// error: {name: 'Response invalid', message: 'No pong in reply'}
			}));
		}
	} catch(error) {
		console.log('Topic tree failed with error:', error);
		dispatch(updateFeatures({
			feature: 'topictreerest',
			status: {message: ERROR_MESSAGE, status: 'failed'},
			error
		}));
	}


	try {
		const isEnabled = await client.checkTLSEnabled();
		if (isEnabled) {
		  	dispatch(updateFeatures({
				feature: 'tls',
				status: 'ok'
			}));
		} else {
		  	dispatch(updateFeatures({
				feature: 'tls',
				status: {message: ERROR_MESSAGE, satatus: 'failed'},
		  	}));
		}
	} catch (error) {
		dispatch(updateFeatures({
		  	feature: 'tls',
		  	status: {message: ERROR_MESSAGE, satatus: 'failed'},
			error
		}));
	}


	let brokerConnected = false;
	const brokerConnections = await client.getBrokerConnections();
	dispatch(updateBrokerConnections(brokerConnections));

	// Select first broker that is connected to the MMC
	for(let i=0; i<brokerConnections.length; i++) {
		const connection = brokerConnections[i];
		if(connection.status.connected) {
			const connectionName = connection.name;
			await client.connectToBroker(connectionName);
			dispatch(updateBrokerConnected(true, connectionName));
			brokerConnected = true;
			break;
		}
	}

	
	const brokerConfigurations = await client.getBrokerConfigurations();
	dispatch(updateBrokerConfigurations(brokerConfigurations));
	const settings = await client.getSettings();
	dispatch(updateSettings(settings));

	dispatch(updateLoading(false));


	try {
		const isEnabled = await client.checkClientControlEnabled();
		if (isEnabled) {
		  	dispatch(updateFeatures({
				feature: 'clientcontrol',
				status: 'ok'
			}));
		} else {
			console.error('Client control not enabled. Status:', isEnabled);
		  	dispatch(updateFeatures({
				feature: 'clientcontrol',
				status: {message: ERROR_MESSAGE, satatus: 'failed'},
		  	}));
		}
	} catch (error) {
		console.error('Error enabling client control:', error);
		dispatch(updateFeatures({
		  	feature: 'clientcontrol',
		  	status: {message: ERROR_MESSAGE, satatus: 'failed'},
			error
		}));
	}

	try {
		const clusters = await client.listClusters();
		dispatch(updateClusters(clusters));
		dispatch(updateFeatures({
			feature: 'clustermanagement',
			status: 'ok'
		}));
		const clusterDetails = {};
		// it's not ideal to make requests for every cluster, but that's what we currently have
		if (clusters && Array.isArray(clusters)) {
			for (const cluster of clusters) {
				clusterDetails[cluster.clustername] = await client.getCluster(cluster.clustername);
			}
		}
		dispatch(updateClusterDetails(clusterDetails));
	} catch (error) {
		console.error('Error listing clusters:', error);
		dispatch(updateFeatures({
			feature: 'clustermanagement',
			status: 'failed',
			error
		}));
	}

	if (brokerConnected) {
		try {
			const testCollections = await client.listTestCollections();
			dispatch(updateTestCollections(testCollections));
		} catch (error) {
			// TODO: handle error
			console.log('Test collections:', error);
		}

		try {
			console.log('Loading dynamic security');

			const clients = await client.listClients(true, 10, 0);
			dispatch(updateClients(clients));
			const clientsAll = await client.listClients(false);
			dispatch(updateClientsAll(clientsAll));
			const groups = await client.listGroups(true, 10, 0);
			dispatch(updateGroups(groups));
			const groupsAll = await client.listGroups(false);
			dispatch(updateGroupsAll(groupsAll));
			const anonymousGroup = await client.getAnonymousGroup();
			dispatch(updateAnonymousGroup(anonymousGroup));
			const roles = await client.listRoles(true, 10, 0);
			dispatch(updateRoles(roles));
			const rolesAll = await client.listRoles(false);
			dispatch(updateRolesAll(rolesAll));


			const defaultACLAccess = await client.getDefaultACLAccess();
			dispatch(updateDefaultACLAccess(defaultACLAccess));
			dispatch(updateFeatures({
				feature: 'dynamicsecurity',
				status: 'ok'
			}));
		} catch(error) {
			console.error('Error loading dynamic security');
			console.error(error);
			// TODO: change when Mosquitto provides feature endpoint
			// there was an error loading some dynamic security part
			// --> we assume that feature has not been loaded
			dispatch(updateFeatures({
				feature: 'dynamicsecurity',
				status: error
			}));
		}
		try {
			console.log('Loading license information');
			const licenseInformation = await client.getLicenseInformation()
			dispatch(updateBrokerLicenseInformation(licenseInformation));
		} catch (error) {
			console.error('Error loading license information');
			console.error(error);
			dispatch(updateBrokerLicenseInformation({}));
		}
		try {
			console.log('Loading inspection');
			const inspectClients = await client.inspectListClients();
			dispatch(updateInspectClients(inspectClients));
			dispatch(updateFeatures({
				feature: 'inspect',
				status: 'ok'
			}));
		} catch (error) {
			console.error('Error loading inspection');
			console.error(error);
			// TODO: change when Mosquitto provides feature endpoint
			// there was an error loading the inspect feature
			// --> we assume that feature has not been loaded
			dispatch(updateFeatures({
				feature: 'inspect',
				status: error
			}));
		}
		try {
			console.log('Loading streams');
			const streams = await client.listStreams();
			dispatch(updateStreams(streams));
			dispatch(updateFeatures({
				feature: 'streamprocessing',
				status: 'ok'
			}));
		} catch (error) {
			console.error('Error loading streams');
			console.error(error);
			// TODO: change when Mosquitto provides feature endpoint
			// there was an error loading the stream feature
			// --> we assume that feature has not been loaded
			dispatch(updateFeatures({
				feature: 'streamprocessing',
				status: error
			}));
		}
	}
}


export default ({ children }) => {
	const dispatch = useDispatch();
	currentConnectionName = useSelector(state => state.brokerConnections?.currentConnectionName);

	const sendMessage = (roomId, message) => {
		const payload = {
			data: message
		};
	};

	if (!ws?.client) {
		let client = new WebMosquittoProxyClient({ logger: console });
		client.closeHandler = (event) => {
			dispatch(updateProxyConnected(false));
		};
		client.on('license-invalid', (message) => {
			dispatch(updateLicenseStatus({
				valid: false,
				data: message.payload
			}));
		});
		client.on('license-valid', (message) => {
			dispatch(updateLicenseStatus({
				valid: true,
				data: message.payload
			}));
		});
		client.on('websocket-clients', (message) => {
			dispatch(updateWebSocketClients(message.payload));
		});
		client.on('websocket-client-connected', (message) => {
			dispatch(updateWebSocketClientConnected(message.payload));
		});
		client.on('websocket-client-disconnected', (message) => {
			dispatch(updateWebSocketClientDisconnected(message.payload));
		});
		client.on('system_status', (message) => {
			dispatch(updateSystemStatus(message.payload));
		});
		client.on('topic_tree', (message) => {
			dispatch(updateTopicTree(message.payload));
		});
		client.on('license', (message) => {
			dispatch(updateLicense(message.payload));
		});
		client.on('version', (message) => {
			dispatch(updateVersion(message.payload));
		});
		client.on('connections', async (message) => {
			dispatch(updateBrokerConnections(message.payload));
			message.payload.forEach((connection) => {
				if (currentConnectionName === connection.name) {
					dispatch(updateBrokerConnected(connection.status.connected, connection.name));
				}
			});
		});
		client.on('sessions-destroyed', async (/* message */) => {
			// logout if session is not valid anymore:
			const { valid } = await client.validateSession();
			if (!valid) window.location.href = '/logout';
		});

		client.on('error', (message) => {
			console.error(message);
		});
		
		dispatch(updateLoading(true));
		init(client, dispatch, { socketEndpointURL: WS_BASE.url, httpEndpointURL: WS_BASE.urlHTTP })
		.catch(error => {
			if (!`${error}`.startsWith('You don\'t have enough user rights')) { // is thrown in case readonly roles
				console.error('Error during initialization:', error);
				try {
					error = JSON.stringify(error);
				} catch(exception) {
					console.error('Could not display error in UI', exception);
				}
				alert(`An unexpected error while communicating with the backend occured: ${error}`);
			} else {
				console.error(error);
			}
			dispatch(updateLoading(false));
		});

		ws = {
			client: client,
			sendMessage
		};
	} 

	return <WebSocketContext.Provider value={ws}>{children}</WebSocketContext.Provider>;
};

import React, { createContext } from 'react';
import {
	updateLicenseStatus,
	updateBrokerConfigurations,
	updateBrokerConnected,
	updateBrokerConnections,
	updateProxyConnected,
	updateClients,
	updateWebSocketClients,
	updateWebSocketClientConnected,
	updateWebSocketClientDisconnected,
	updateAnonymousGroup,
	updateGroups,
	updateLicense,
	updateDefaultACLAccess,
	updateRoles,
	updateSettings,
	updateStreams,
	updateSystemStatus,
	updateTopicTree,
	updateVersion,
	updateEditDefaultClient,
	updateFeatures,
	updateUserProfile,
} from '../actions/actions';

import {
	updateUserRoles,
	updateUsers,
} from '../admin/users/actions/actions';

import {
	updateClusters
} from '../admin/clusters/actions/actions';

import WS_BASE from './config';
import WebMosquittoProxyClient from '../client/WebMosquittoProxyClient';
import { useDispatch } from 'react-redux';

const WebSocketContext = createContext(null);

export { WebSocketContext };


const init = async (client, dispatch, connectionConfiguration) => {
	// TODO: merge with code from BrokerSelect
	await client.connect(connectionConfiguration)
	dispatch(updateProxyConnected(true));
	try {
		const userProfile = await client.getUserProfile();
		dispatch(updateUserProfile(userProfile));
		const userRoles = await client.listUserRoles();
		dispatch(updateUserRoles(userRoles));
		const users = await client.listUsers();
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
		const clusters = await client.listClusters();
		dispatch(updateClusters(clusters));
		dispatch(updateFeatures({
			feature: 'clustermanagement',
			status: 'ok'
		}));
	} catch (error) {
		dispatch(updateFeatures({
			feature: 'clustermanagement',
			status: 'failed',
			error
		}));
	}

	const brokerConnections = await client.getBrokerConnections();
	dispatch(updateBrokerConnections(brokerConnections));

	// Select first broker that is connected to the MMC
	for(let i=0; i<brokerConnections.length; i++) {
		const connection = brokerConnections[i];
		if(connection.status.connected) {
			const connectionName = connection.name;
			await client.connectToBroker(connectionName);
			dispatch(updateBrokerConnected(true, connectionName));
			break;
		}
	}
	
	const brokerConfigurations = await client.getBrokerConfigurations();
	dispatch(updateBrokerConfigurations(brokerConfigurations));
	const settings = await client.getSettings();
	dispatch(updateSettings(settings));
	try {
		const clients = await client.listClients();
		dispatch(updateClients(clients));
		const groups = await client.listGroups();
		dispatch(updateGroups(groups));
		const anonymousGroup = await client.getAnonymousGroup();
		dispatch(updateAnonymousGroup(anonymousGroup));
		const roles = await client.listRoles();
		dispatch(updateRoles(roles));
		const defaultACLAccess = await client.getDefaultACLAccess();
		dispatch(updateDefaultACLAccess(defaultACLAccess));
		dispatch(updateFeatures({
			feature: 'dynamicsecurity',
			status: 'ok'
		}));
	} catch(error) {
		// TODO: change when Mosquitto provides feature endpoint
		// there was an error loading some dynamic security part
		// --> we assume that feature has not been loaded
		dispatch(updateFeatures({
			feature: 'dynamicsecurity',
			status: error
		}));
	}
	try {
		const streams = await client.listStreams();
		dispatch(updateStreams(streams));
		dispatch(updateFeatures({
			feature: 'streamprocessing',
			status: 'ok'
		}));
	} catch (error) {
		// TODO: change when Mosquitto provides feature endpoint
		// there was an error loading the stream feature
		// --> we assume that feature has not been loaded
		dispatch(updateFeatures({
			feature: 'streamprocessing',
			status: error
		}));
	}
}

export default ({ children }) => {
	let client;
	let ws;

	const dispatch = useDispatch();

	const sendMessage = (roomId, message) => {
		const payload = {
			data: message
		};
	};

	if (!client) {
		client = new WebMosquittoProxyClient({ logger: console });
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
				dispatch(updateBrokerConnected(connection.status.connected, connection.name));
			});
		});
		client.on('error', (message) => {
			console.error(message);
		});
		
		init(client, dispatch, { socketEndpointURL: WS_BASE.url, httpEndpointURL: WS_BASE.urlHTTP });

		ws = {
			client: client,
			sendMessage
		};
	}

	return <WebSocketContext.Provider value={ws}>{children}</WebSocketContext.Provider>;
};

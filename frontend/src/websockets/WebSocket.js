import React, { createContext } from 'react';
import WS_BASE from './config';
import { useDispatch } from 'react-redux';
import {
	updateGroups,
	updateRoles,
	updateClients,
	updateBrokerConfigurations,
	updateBrokerConnected,
	updateBrokerConnections,
	updateLicense,
	updateVersion,
	updateSystemStatus,
	updateTopicTree
} from '../actions/actions';
import WebMosquittoProxyClient from '../client/WebMosquittoProxyClient';

const WebSocketContext = createContext(null);

export { WebSocketContext };

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
		// TOOD: integrate Mosquitto client
		client = new WebMosquittoProxyClient({ logger: console });

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
		client.on('connections', (message) => {
			dispatch(updateBrokerConnections(message.payload));
			message.payload.forEach((connection) => {
				dispatch(updateBrokerConnected(connection.status.connected, connection.name));
			})
		});
		client.on('error', (message) => {
			console.error(message);
		});
		// TODO: merge with code from BrokerSelect
		client
			.connect({ socketEndpointURL: WS_BASE.url })
			.then(() => client.getBrokerConnections())
			.then((brokerConnections) => {
				dispatch(updateBrokerConnections(brokerConnections));
				return brokerConnections;
			})
			.then(async (brokerConnections) => {
				if (brokerConnections[0]) {
					const connectionName = brokerConnections[0]?.name;
					await client.connectToBroker(connectionName);
					dispatch(updateBrokerConnected(true, connectionName));
				}
			})
			.then(() => client.getBrokerConfigurations())
			.then((brokerConfigurations) => {
				dispatch(updateBrokerConfigurations(brokerConfigurations));
			})
			.then(() => client.listClients())
			.then((clients) => {
				dispatch(updateClients(clients));
			})
			.then(() => client.listGroups())
			.then((groups) => {
				dispatch(updateGroups(groups));
			})
			.then(() => client.listRoles())
			.then((roles) => {
				dispatch(updateRoles(roles));
			});

		ws = {
			client: client,
			sendMessage
		};
	}

	return <WebSocketContext.Provider value={ws}>{children}</WebSocketContext.Provider>;
};

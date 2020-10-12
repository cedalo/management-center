import React, { createContext } from 'react'
import WS_BASE from './config';
import { useDispatch } from 'react-redux';
import { updateGroups, updateRoles, updateClients, updateBrokerConfigurations, updateBrokerConnected, updateBrokerConnections, updateLicense, updateSystemStatus, updateTopicTree } from '../actions/actions';
import WebMosquittoProxyClient from '../client/WebMosquittoProxyClient';

const WebSocketContext = createContext(null)

export { WebSocketContext }

export default ({ children }) => {
	let client;
    let ws;

    const dispatch = useDispatch();

    const sendMessage = (roomId, message) => {
        const payload = {
            data: message
		}
    }

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
		})
		// TODO: merge with code from BrokerSelect
		client.connect({ socketEndpointURL: WS_BASE.url })
			.then(() => client.connectToBroker('Mosquitto 2.0 Preview'))
			.then(() => {
				dispatch(updateBrokerConnected(true));
			})
			.then(() => client.getBrokerConnections())
			.then(brokerConnections => {
				dispatch(updateBrokerConnections(brokerConnections));
			})
			.then(() => client.getBrokerConfigurations())
			.then(brokerConfigurations => {
				dispatch(updateBrokerConfigurations(brokerConfigurations));
			})
			.then(() => client.listClients())
			.then(clients => {
				dispatch(updateClients(clients));
			})
			.then(() => client.listGroups())
			.then(groups => {
				dispatch(updateGroups(groups));
			})
			.then(() => client.listRoles())
			.then(roles => {
				dispatch(updateRoles(roles));
			});

        ws = {
            client: client,
            sendMessage
        }
    }

    return (
        <WebSocketContext.Provider value={ws}>
            {children}
        </WebSocketContext.Provider>
    )
}
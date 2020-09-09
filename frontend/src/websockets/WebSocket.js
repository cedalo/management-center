import React, { createContext } from 'react'
import WS_BASE from './config';
import { useDispatch } from 'react-redux';
import { updateBrokerConfigurations, updateBrokerConnections, updateSystemStatus, updateTopicTree } from '../actions/actions';
import WebMosquittoClient from '../client/WebMosquittoClient';

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
		console.log('sendMessage()');
    }

    if (!client) {
		// TOOD: integrate Mosquitto client
		client = new WebMosquittoClient({ logger: console });
		client.connect({ socketEndpointURL: WS_BASE.url })
			.then(() => client.connectToBroker('Mosquitto 1'))
			.then(() => console.log('connected to broker'))
			.then(() => client.getBrokerConnections())
			.then(brokerConnections => {
				dispatch(updateBrokerConnections(brokerConnections));
			})
			.then(() => client.getBrokerConfigurations())
			.then(brokerConfigurations => {
				dispatch(updateBrokerConfigurations(brokerConfigurations));
			});

		client.on('system_status', (message) => {
			console.log(message);
			dispatch(updateSystemStatus(message.payload));
		});
		client.on('topic_tree', (message) => {
			dispatch(updateTopicTree(message.payload));
		})

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
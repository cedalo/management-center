import React, { createContext } from 'react'
import WS_BASE from './config';
import { useDispatch } from 'react-redux';
import { updateSystemStatus, updateTopicTree } from '../actions/actions';
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
		client.connect({ socketEndpointURL: WS_BASE.url });

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
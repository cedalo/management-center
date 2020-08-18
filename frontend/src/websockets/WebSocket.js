import React, { createContext } from 'react'
import WS_BASE from './config';
import { useDispatch } from 'react-redux';
import { updateSystemStatus, updateTopicTree } from '../actions/actions';

const WebSocketContext = createContext(null)

export { WebSocketContext }

export default ({ children }) => {
    let socket;
    let ws;

    const dispatch = useDispatch();

    const sendMessage = (roomId, message) => {
        const payload = {
            roomId: roomId,
            data: message
        }
        socket.emit("event://send-message", JSON.stringify(payload));
    }

    if (!socket) {
        socket = new WebSocket(WS_BASE.url);

        socket.onmessage = (msg) => {
			try {
				const messageObject = JSON.parse(msg.data);
				// TODO: handle type of message
				if (messageObject.type === 'system_status') {
					dispatch(updateSystemStatus(messageObject.payload));
				} else if (messageObject.type === 'topic_tree') {
					dispatch(updateTopicTree(messageObject.payload));
				} 
			} catch (error) {
				//TODO: handle error
			}
        }

        ws = {
            socket: socket,
            sendMessage
        }
    }

    return (
        <WebSocketContext.Provider value={ws}>
            {children}
        </WebSocketContext.Provider>
    )
}
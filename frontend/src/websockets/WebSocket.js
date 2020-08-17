import React, { createContext } from 'react'
import WS_BASE from './config';
import { useDispatch } from 'react-redux';
import { updateSystemStatus } from '../actions/actions';

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
				const payload = JSON.parse(msg.data);
				// TODO: handle type of message
				console.log(payload);
				dispatch(updateSystemStatus(payload));
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
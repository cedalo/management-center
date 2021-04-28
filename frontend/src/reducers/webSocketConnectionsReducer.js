import * as ActionTypes from '../constants/ActionTypes';

export default function webSocketConnections(state = {}, action) {
	const newState = { ...state };
	switch (action.type) {
		case ActionTypes.UPDATE_WEBSOCKET_CLIENTS:
			newState.webSocketConnections = action.update;
			// TODO: quick fix to solve duplicate WebSocket connections
			newState.webSocketConnections.webSocketClients = 
				Math.floor(newState.webSocketConnections.webSocketClients / 2);
			break;
		// case ActionTypes.UPDATE_WEBSOCKET_CLIENT_CONNECTED:
		// 	newState.webSocketConnections.clientJoined = true;
		// 	break;
		// case ActionTypes.UPDATE_WEBSOCKET_CLIENT_DISCONNECTED:
		// 	newState.webSocketConnections.clientLeft = true;
		// 	break;
		default:
	}
	return newState;
}

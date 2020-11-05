import * as ActionTypes from '../constants/ActionTypes';

export default function brokerConnections(state = {}, action) {
	const newState = { ...state };
	switch (action.type) {
		case ActionTypes.UPDATE_BROKER_CONNECTED:
			newState.connected = action.connected;
			break;
		case ActionTypes.UPDATE_BROKER_CONNECTIONS:
			newState.brokerConnections = action.update;
			break;
		default:
	}
	return newState;
}

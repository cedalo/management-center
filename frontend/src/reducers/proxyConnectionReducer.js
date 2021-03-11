import * as ActionTypes from '../constants/ActionTypes';

export default function proxyConnection(state = {}, action) {
	const newState = { ...state };
	switch (action.type) {
		case ActionTypes.UPDATE_PROXY_CONNECTED:
			newState.connected = action.update.connected;
			break;
		default:
	}
	return newState;
}

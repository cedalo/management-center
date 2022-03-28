import * as ActionTypes from '../actions/ActionTypes';

export default function inspectClients(state = {}, action) {
	const newState = { ...state };
	switch (action.type) {
		case ActionTypes.UPDATE_INSPECT_CLIENT:
			newState.client = action.update;
			break;
		case ActionTypes.UPDATE_INSPECT_CLIENTS:
			newState.clients = action.update;
			break;
		default:
	}
	return newState;
}

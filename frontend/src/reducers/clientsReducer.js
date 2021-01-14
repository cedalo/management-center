import * as ActionTypes from '../constants/ActionTypes';

export default function clients(state = {}, action) {
	const newState = { ...state };
	switch (action.type) {
		case ActionTypes.UPDATE_CLIENT:
			newState.client = action.update;
			break;
		case ActionTypes.UPDATE_CLIENTS:
			newState.clients = action.update;
			break;
		default:
	}
	return newState;
}

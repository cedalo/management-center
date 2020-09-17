import * as ActionTypes from '../constants/ActionTypes';

export default function users(state = {}, action) {
	const newState = { ...state };
	switch (action.type) {
		case ActionTypes.UPDATE_USERS:
			newState.users = action.update;
			break;
		default:
	}
	return newState;
}
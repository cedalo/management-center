import * as ActionTypes from '../actions/ActionTypes';

export default function users(state = {}, action) {
	const newState = { ...state };
	switch (action.type) {
		case ActionTypes.UPDATE_USER:
			newState.user = action.update;
			break;
		case ActionTypes.UPDATE_USERS:
			newState.users = action.update;
			break;
		default:
	}
	return newState;
}

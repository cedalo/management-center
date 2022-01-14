import * as ActionTypes from '../actions/ActionTypes';

export default function userRoles(state = {}, action) {
	const newState = { ...state };
	switch (action.type) {
		case ActionTypes.UPDATE_USER_ROLES:
			newState.userRoles = action.update;
			break;
		default:
	}
	return newState;
}

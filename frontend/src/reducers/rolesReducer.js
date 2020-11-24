import * as ActionTypes from '../constants/ActionTypes';

export default function roles(state = {}, action) {
	const newState = { ...state };
	switch (action.type) {
		case ActionTypes.UPDATE_DEFAULT_ACL_ACESS:
			newState.defaultACLAccess = action.update;
			break;
		case ActionTypes.UPDATE_ROLE:
			newState.role = action.update;
			break;
		case ActionTypes.UPDATE_ROLES:
			newState.roles = action.update;
			break;
		default:
	}
	return newState;
}

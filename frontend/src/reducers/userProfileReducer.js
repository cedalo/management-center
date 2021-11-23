import * as ActionTypes from '../constants/ActionTypes';

export default function userProfileReducer(state = {}, action) {
	const newState = { ...state };
	switch (action.type) {
		case ActionTypes.UPDATE_USER_PROFILE:
			newState.userProfile = action.update;
			break;
		default:
	}
	return newState;
}

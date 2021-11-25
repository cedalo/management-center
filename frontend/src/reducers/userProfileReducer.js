import * as ActionTypes from '../constants/ActionTypes';

export default function userProfileReducer(state = {}, action) {
	const newState = { ...state };
	switch (action.type) {
		case ActionTypes.UPDATE_USER_PROFILE:
			newState.userProfile = action.update;
			newState.userProfile.isAdmin = newState.userProfile.roles.includes('admin');
			newState.userProfile.isEditor = newState.userProfile.roles.includes('editor');
			newState.userProfile.isViewer = newState.userProfile.roles.includes('viewer');
			break;
		default:
	}
	return newState;
}

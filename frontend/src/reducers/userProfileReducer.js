import * as ActionTypes from '../constants/ActionTypes';


const ADMIN_ROLE = 'admin';
const EDITOR_ROLE = 'editor';
const VIEW_ROLE = 'viewer';


export default function userProfileReducer(state = {}, action) {
	const newState = { ...state };
	switch (action.type) {
		case ActionTypes.UPDATE_USER_PROFILE:
			newState.userProfile = action.update;
			newState.userProfile.isAdmin = newState.userProfile.roles.includes(ADMIN_ROLE);
			newState.userProfile.isEditor = newState.userProfile.roles.includes(EDITOR_ROLE);
			newState.userProfile.isViewer = newState.userProfile.roles.includes(VIEW_ROLE);

			if (!newState.userProfile.connections) {
				break;
			}

			for (const connection of newState.userProfile.connections) {
				connection.isAdmin = (connection.role === ADMIN_ROLE);
				connection.isEditor = (connection.role === EDITOR_ROLE);
				connection.isViewer = (connection.role === VIEW_ROLE);
			}
			break;
		default:
	}
	return newState;
}

import * as ActionTypes from './ActionTypes';

export function updateUserRoles(update) {
	return {
		type: ActionTypes.UPDATE_USER_ROLES,
		update
	};
}

export function updateUser(update) {
	return {
		type: ActionTypes.UPDATE_USER,
		update
	};
}

export function updateUsers(update) {
	return {
		type: ActionTypes.UPDATE_USERS,
		update
	};
}


export function updateUserGroups(update) {
	return {
		type: ActionTypes.UPDATE_USER_GROUPS,
		update
	};
}


export function updateUserGroup(update) {
	return {
		type: ActionTypes.UPDATE_USER_GROUP,
		update
	};
}
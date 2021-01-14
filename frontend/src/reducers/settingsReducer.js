import * as ActionTypes from '../constants/ActionTypes';

export default function settings(state = {}, action) {
	const newState = { ...state };
	switch (action.type) {
		case ActionTypes.UPDATE_SETTINGS:
			newState.settings = action.update;
			break;
		default:
	}
	return newState;
}

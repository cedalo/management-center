import * as ActionTypes from '../constants/ActionTypes';

export default function version(state = {}, action) {
	const newState = { ...state };
	switch (action.type) {
		case ActionTypes.UPDATE_VERSION:
			newState.version = action.update;
			break;
		default:
	}
	return newState;
}

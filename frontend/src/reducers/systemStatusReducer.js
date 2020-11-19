import * as ActionTypes from '../constants/ActionTypes';

export default function systemStatus(state = {}, action) {
	const newState = { ...state };
	switch (action.type) {
		case ActionTypes.UPDATE_SYSTEM_STATUS:
			newState.systemStatus = action.update;
			newState.lastUpdated = Date.now();
			break;
		default:
	}
	return newState;
}

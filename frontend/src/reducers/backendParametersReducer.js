import * as ActionTypes from '../constants/ActionTypes';

export default function packendParameters(state = {}, action) {
	const newState = { ...state };
	switch (action.type) {
		case ActionTypes.UPDATE_BACKEND_PARAMETERS:
			newState.backendParameters = action.update;
			break;
		default:
	}
	return newState;
}

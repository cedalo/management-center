import * as ActionTypes from '../constants/ActionTypes';

export default function streams(state = {}, action) {
	const newState = { ...state };
	switch (action.type) {
		case ActionTypes.UPDATE_STREAM:
			newState.stream = action.update;
			break;
		case ActionTypes.UPDATE_STREAMS:
			newState.streams = action.update;
			break;
		default:
	}
	return newState;
}

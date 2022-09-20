import * as ActionTypes from '../constants/ActionTypes';


export default function applicationTokens(state={}, action) {
	const newState = { ...state };
	switch (action.type) {
		case ActionTypes.UPDATE_APPLICATION_TOKENS:
			newState.tokens = action.update;
			break;
		default:
	}
	return newState;
}

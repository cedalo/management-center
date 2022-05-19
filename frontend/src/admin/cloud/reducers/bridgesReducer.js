import * as ActionTypes from '../actions/ActionTypes';

export default function bridges(state = {}, action) {
	const newState = { ...state };
	switch (action.type) {
		case ActionTypes.UPDATE_BRIDGE:
			newState.bridge = action.update;
			break;
		case ActionTypes.UPDATE_BRIDGES:
			newState.bridges = action.update;
			break;
		default:
	}
	return newState;
}

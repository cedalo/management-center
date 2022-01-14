import * as ActionTypes from '../actions/ActionTypes';

export default function clusters(state = {}, action) {
	const newState = { ...state };
	switch (action.type) {
		case ActionTypes.UPDATE_CLUSTER:
			newState.cluster = action.update;
			break;
		case ActionTypes.UPDATE_CLUSTERS:
			newState.clusters = action.update;
			break;
		default:
	}
	return newState;
}

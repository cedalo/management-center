import * as ActionTypes from '../constants/ActionTypes';

export default function topicTreeReducer(state = {}, action) {
	const newState = { ...state };
	switch (action.type) {
		case ActionTypes.UPDATE_TOPIC_TREE:
			newState.topicTree = action.update;
			break;
		default:
	}
	return newState;
}

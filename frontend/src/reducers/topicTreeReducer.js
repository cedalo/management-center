import * as ActionTypes from '../constants/ActionTypes';

// TODO: quick fix, remove if this is fixed on server-side
let currentTopicTreeConnectionName;

export default function topicTreeReducer(state = {}, action) {
	const newState = { ...state };
	switch (action.type) {
		case ActionTypes.UPDATE_TOPIC_TREE:
			// Quick fix: only update if selected topic tree is the same
			if (state.topicTree === undefined || currentTopicTreeConnectionName === action.update._name) {
				newState.topicTree = action.update;
			}
			break;
		case ActionTypes.UPDATE_BROKER_CONNECTED:
			currentTopicTreeConnectionName = action.update.connectionName;
			break;
		default:
	}
	return newState;
}

import * as ActionTypes from '../constants/ActionTypes';

export default function brokerConfigurations(state = {}, action) {
	console.log("action");
	console.log(action.update)
	const newState = { ...state };
	switch (action.type) {
		case ActionTypes.UPDATE_BROKER_CONFIGURATIONS:
			newState.brokerConfigurations = action.update;
			break;
		default:
	}
	return newState;
}
import * as ActionTypes from '../constants/ActionTypes';

export default function loading(state = {}, action) {
	const newState = { ...state };
	switch (action.type) {
		case ActionTypes.UPDATE_LOADING:
			newState.loadingStatus = action.update.loadingStatus;
			break;
		default:
	}
	return newState;
}
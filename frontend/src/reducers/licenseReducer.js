import * as ActionTypes from '../constants/ActionTypes';

export default function license(state = {}, action) {
	const newState = { ...state };
	switch (action.type) {
		case ActionTypes.UPDATE_LICENSE:
			newState.license = action.update;
			break;
		case ActionTypes.UPDATE_LICENSE_STATUS:
			newState.licenseStatus = action.update;
			break;
		default:
	}
	return newState;
}

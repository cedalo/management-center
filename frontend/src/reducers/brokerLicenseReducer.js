import * as ActionTypes from '../constants/ActionTypes';

export default function brokerLicense(state = {}, action) {
	const newState = { ...state };
	switch (action.type) {
		case ActionTypes.UPDATE_BROKER_LICENSE_INFORMATION:
			newState.license = action.update;
			if (newState.license) {
				newState.isLoading = false;
			} else {
				newState.isLoading = true;
			}
			break;
		default:
	}
	return newState;
}

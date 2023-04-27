import * as ActionTypes from '../constants/ActionTypes';

export default function clients(state = {}, action) {
	const newState = { ...state };
	switch (action.type) {
		case ActionTypes.UPDATE_CLIENT:
			newState.client = action.update;
			break;
		case ActionTypes.UPDATE_CLIENTS:
			newState.clients = action.update;
			break;
		case ActionTypes.UPDATE_CLIENTS_ALL:
			newState.clientsAll = action.update;
			break;
		case ActionTypes.UPDATE_CLIENTS_ROWS_PER_PAGE:
			newState.rowsPerPage = action.update;
			break;
		case ActionTypes.UPDATE_CLIENTS_PAGE:
			newState.page = action.update;
			break;
		default:
	}
	return newState;
}

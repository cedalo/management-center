import * as ActionTypes from './ActionTypes';

export function updateInspectClient(update) {
	return {
		type: ActionTypes.UPDATE_INSPECT_CLIENT,
		update
	};
}

export function updateInspectClients(update) {
	return {
		type: ActionTypes.UPDATE_INSPECT_CLIENTS,
		update
	};
}

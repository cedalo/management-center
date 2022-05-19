import * as ActionTypes from './ActionTypes';

export function updateBridge(update) {
	return {
		type: ActionTypes.UPDATE_BRIDGE,
		update
	};
}

export function updateBridges(update) {
	return {
		type: ActionTypes.UPDATE_BRIDGES,
		update
	};
}

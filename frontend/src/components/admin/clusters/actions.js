import * as ActionTypes from './ActionTypes';

export function updateClusters(update) {
	return {
		type: ActionTypes.UPDATE_CLUSTERS,
		update
	};
}

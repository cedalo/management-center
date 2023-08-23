import * as ActionTypes from './ActionTypes';

export function updateCluster(update) {
	return {
		type: ActionTypes.UPDATE_CLUSTER,
		update
	};
}

export function updateClusters(update) {
	return {
		type: ActionTypes.UPDATE_CLUSTERS,
		update
	};
}


export function updateClusterDetails(update) {
	return {
		type: ActionTypes.UPDATE_CLUSTER_DETAILS,
		update
	};
}
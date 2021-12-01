import * as ActionTypes from '../constants/ActionTypes';

export function updateLicenseStatus(update) {
	return {
		type: ActionTypes.UPDATE_LICENSE_STATUS,
		update
	};
}

export function updateUserProfile(update) {
	return {
		type: ActionTypes.UPDATE_USER_PROFILE,
		update
	};
}

export function updateClient(update) {
	return {
		type: ActionTypes.UPDATE_CLIENT,
		update
	};
}

export function updateClients(update) {
	return {
		type: ActionTypes.UPDATE_CLIENTS,
		update
	};
}

export function updateWebSocketClients(update) {
	return {
		type: ActionTypes.UPDATE_WEBSOCKET_CLIENTS,
		update
	};
}

export function updateWebSocketClientConnected(update) {
	return {
		type: ActionTypes.UPDATE_WEBSOCKET_CLIENT_CONNECTED,
		update
	};
}

export function updateWebSocketClientDisconnected(update) {
	return {
		type: ActionTypes.UPDATE_WEBSOCKET_CLIENT_DISCONNECTED,
		update
	};
}

export function updateAnonymousGroup(update) {
	return {
		type: ActionTypes.UPDATE_ANONYMOUS_GROUP,
		update
	};
}

export function updateGroup(update) {
	return {
		type: ActionTypes.UPDATE_GROUP,
		update
	};
}

export function updateGroups(update) {
	return {
		type: ActionTypes.UPDATE_GROUPS,
		update
	};
}

export function updateDefaultACLAccess(update) {
	return {
		type: ActionTypes.UPDATE_DEFAULT_ACL_ACESS,
		update
	};
}

export function updateRole(update) {
	return {
		type: ActionTypes.UPDATE_ROLE,
		update
	};
}

export function updateRoles(update) {
	return {
		type: ActionTypes.UPDATE_ROLES,
		update
	};
}

export function updateBrokerConfigurations(update) {
	return {
		type: ActionTypes.UPDATE_BROKER_CONFIGURATIONS,
		update
	};
}

export function updateBrokerConnected(connected, connectionName) {
	return {
		type: ActionTypes.UPDATE_BROKER_CONNECTED,
		update: {
			connected,
			connectionName
		}
	};
}

export function updateBrokerConnections(update) {
	return {
		type: ActionTypes.UPDATE_BROKER_CONNECTIONS,
		update
	};
}

export function updateProxyConnected(connected) {
	return {
		type: ActionTypes.UPDATE_PROXY_CONNECTED,
		update: {
			connected
		}
	};
}

export function updateSettings(update) {
	return {
		type: ActionTypes.UPDATE_SETTINGS,
		update
	};
}

export function updateVersion(update) {
	return {
		type: ActionTypes.UPDATE_VERSION,
		update
	};
}

export function updateLicense(update) {
	return {
		type: ActionTypes.UPDATE_LICENSE,
		update
	};
}

export function updateStream(update) {
	return {
		type: ActionTypes.UPDATE_STREAM,
		update
	};
}

export function updateStreams(update) {
	return {
		type: ActionTypes.UPDATE_STREAMS,
		update
	};
}

export function updateSystemStatus(update) {
	return {
		type: ActionTypes.UPDATE_SYSTEM_STATUS,
		update
	};
}

export function updateFeatures(update) {
	return {
		type: ActionTypes.UPDATE_FEATURES,
		update
	};
}

export function updateTopicTree(update) {
	return {
		type: ActionTypes.UPDATE_TOPIC_TREE,
		update
	};
}

export function deletedClient(update) {
	return {
		type: ActionTypes.DELETED_USER,
		update
	};
}

export function updateEditDefaultClient(edit) {
	return {
		type: ActionTypes.UPDATE_EDIT_DEFAULT_CLIENT,
		edit
	};
}

export function updateSelectedConnection(update) {
	return {
		type: ActionTypes.UPDATE_SELECTED_CONNECTION,
		update
	};
}

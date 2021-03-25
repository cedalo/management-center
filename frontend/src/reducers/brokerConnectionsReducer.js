import * as ActionTypes from '../constants/ActionTypes';

export default function brokerConnections(state = {}, action) {
	const newState = { ...state };
	switch (action.type) {
		case ActionTypes.UPDATE_BROKER_CONNECTED:
			newState.connected = action.update.connected;
			newState.currentConnectionName = action.update.connectionName;
			break;
		case ActionTypes.UPDATE_BROKER_CONNECTIONS:
			newState.brokerConnections = action.update;
			break;
		case ActionTypes.UPDATE_EDIT_DEFAULT_CLIENT:
			newState.editDefaultClient = action.edit;
			break;
		case ActionTypes.UPDATE_SELECTED_CONNECTION:
			newState.selectedConnectionToEdit = action.update;
			break;
		default:
	}
	if (newState.currentConnectionName && newState.brokerConnections) {
		newState.currentConnection = newState.brokerConnections?.find((brokerConnection) => {
			return brokerConnection.name === newState.currentConnectionName;
		});
		newState.defaultClient = {
			username: newState.currentConnection?.credentials?.username
		};
	}

	return newState;
}

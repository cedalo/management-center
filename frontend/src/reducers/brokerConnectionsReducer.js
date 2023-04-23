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

			// TODO: figure out if it is necessary to also update selectedConnectionToEdit when updating all broker conenctions
			// TODO contunue: because technically a user can have a tab where only selectedConnectionToEdit is mapped to props open when update of all the connections is initiated (I belive this happens in connectionDetailComponent)
			// if (newState.selectedConnectionToEdit) {
			// 	newState.brokerConnections.forEach(el => {
			// 		if (newState.selectedConnectionToEdit.id === el.id) {
			// 			newState.selectedConnectionToEdit = JSON.parse(JSON.stringify(el));
			// 		}
			// 	})
			// }
			
			break;
		case ActionTypes.UPDATE_EDIT_DEFAULT_CLIENT:
			newState.editDefaultClient = action.edit;
			break;
		case ActionTypes.UPDATE_SELECTED_CONNECTION:
			newState.selectedConnectionToEdit = action.update;
			break;
		default:
			// console.log('DEFAULT called!!!', action.type);
	}
	if ([ActionTypes.UPDATE_BROKER_CONNECTED,
		ActionTypes.UPDATE_EDIT_DEFAULT_CLIENT,
		ActionTypes.UPDATE_SELECTED_CONNECTION
		].includes(action.type)) {
		if (newState.currentConnectionName && newState.brokerConnections) {
			newState.currentConnection = newState.brokerConnections?.find((brokerConnection) => {
				return brokerConnection.name === newState.currentConnectionName;
			});
			newState.defaultClient = {
				username: newState.currentConnection?.credentials?.username
			};
		}
	}

	return newState;
}

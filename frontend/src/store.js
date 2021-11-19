/* eslint-disable */
import { createStore, combineReducers } from 'redux';
import brokerConfigurationsReducer from './reducers/brokerConfigurationsReducer';
import brokerConnectionsReducer from './reducers/brokerConnectionsReducer';
import proxyConnectionReducer from './reducers/proxyConnectionReducer';
import groupsReducer from './reducers/groupsReducer';
import licenseReducer from './reducers/licenseReducer';
import versionsReducer from './reducers/versionsReducer';
import rolesReducer from './reducers/rolesReducer';
import streamsReducer from './reducers/streamsReducer';
import systemStatusReducer from './reducers/systemStatusReducer';
import topicTreeReducer from './reducers/topicTreeReducer';
import clientsReducer from './reducers/clientsReducer';
import userRolesReducer from './reducers/userRolesReducer';
import usersReducer from './reducers/usersReducer';
import settingsReducer from './reducers/settingsReducer';
import webSocketConnectionsReducer from './reducers/webSocketConnectionsReducer';

const store = createStore(
	combineReducers({
		brokerConfigurations: brokerConfigurationsReducer,
		brokerConnections: brokerConnectionsReducer,
		proxyConnection: proxyConnectionReducer,
		groups: groupsReducer,
		license: licenseReducer,
		version: versionsReducer,
		roles: rolesReducer,
		settings: settingsReducer,
		webSocketConnections: webSocketConnectionsReducer,
		streams: streamsReducer,
		systemStatus: systemStatusReducer,
		topicTree: topicTreeReducer,
		clients: clientsReducer,
		userRoles: userRolesReducer,
		users: usersReducer,
	})
);

export default store;

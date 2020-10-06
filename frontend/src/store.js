/* eslint-disable */
import { createStore, combineReducers } from 'redux';
import brokerConfigurationsReducer from './reducers/brokerConfigurationsReducer';
import brokerConnectionsReducer from './reducers/brokerConnectionsReducer';
import groupsReducer from './reducers/groupsReducer';
import licenseReducer from './reducers/licenseReducer';
import rolesReducer from './reducers/rolesReducer';
import systemStatusReducer from './reducers/systemStatusReducer';
import topicTreeReducer from './reducers/topicTreeReducer';
import clientsReducer from './reducers/clientsReducer';

const store = createStore(combineReducers({
	brokerConfigurations: brokerConfigurationsReducer,
	brokerConnections: brokerConnectionsReducer,
	groups: groupsReducer,
	license: licenseReducer,
	roles: rolesReducer,
	systemStatus: systemStatusReducer,
	topicTree: topicTreeReducer,
	clients: clientsReducer,
}));

export default store;

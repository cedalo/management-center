/* eslint-disable */
import { createStore, combineReducers } from 'redux';
import brokerConfigurationsReducer from './reducers/brokerConfigurationsReducer';
import brokerConnectionsReducer from './reducers/brokerConnectionsReducer';
import groupsReducer from './reducers/groupsReducer';
import licenseReducer from './reducers/licenseReducer';
import systemStatusReducer from './reducers/systemStatusReducer';
import topicTreeReducer from './reducers/topicTreeReducer';
import usersReducer from './reducers/usersReducer';

const store = createStore(combineReducers({
	brokerConfigurations: brokerConfigurationsReducer,
	brokerConnections: brokerConnectionsReducer,
	groups: groupsReducer,
	license: licenseReducer,
	systemStatus: systemStatusReducer,
	topicTree: topicTreeReducer,
	users: usersReducer,
}));

export default store;

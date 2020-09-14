/* eslint-disable */
import { createStore, combineReducers } from 'redux';
import brokerConfigurationsReducer from './reducers/brokerConfigurationsReducer';
import brokerConnectionsReducer from './reducers/brokerConnectionsReducer';
import systemStatusReducer from './reducers/systemStatusReducer';
import topicTreeReducer from './reducers/topicTreeReducer';
import usersReducer from './reducers/usersReducer';

const store = createStore(combineReducers({
	brokerConfigurations: brokerConfigurationsReducer,
	brokerConnections: brokerConnectionsReducer,
	systemStatus: systemStatusReducer,
	topicTree: topicTreeReducer,
	users: usersReducer,
}));

export default store;

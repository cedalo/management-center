/* eslint-disable */
import { createStore, combineReducers } from 'redux';
import brokerConnectionsReducer from './reducers/brokerConnectionsReducer';
import systemStatusReducer from './reducers/systemStatusReducer';
import topicTreeReducer from './reducers/topicTreeReducer';

const store = createStore(combineReducers({
	brokerConnections: brokerConnectionsReducer,
	systemStatus: systemStatusReducer,
	topicTree: topicTreeReducer
}));

export default store;

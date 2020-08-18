/* eslint-disable */
import { createStore, combineReducers } from 'redux';
import systemStatusReducer from './reducers/systemStatusReducer';
import topicTreeReducer from './reducers/topicTreeReducer';

const store = createStore(combineReducers({
	systemStatus: systemStatusReducer,
	topicTree: topicTreeReducer
}));

export default store;

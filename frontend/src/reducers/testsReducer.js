import * as ActionTypes from '../constants/ActionTypes';

export default function tests(state = {}, action) {
    const newState = { ...state };
    switch (action.type) {
        case ActionTypes.UPDATE_TESTCOLLECTION:
            newState.testCollection = action.update;
            break;
        case ActionTypes.UPDATE_TESTCOLLECTIONS:
            newState.testCollections = action.update;
            break;
        case ActionTypes.UPDATE_TEST:
            newState.test = action.update;
            break;
        case ActionTypes.UPDATE_TESTS:
            newState.tests = action.update;
            break;
        default:
    }
    return newState;
}

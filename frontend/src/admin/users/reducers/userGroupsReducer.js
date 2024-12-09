import * as ActionTypes from '../actions/ActionTypes';

export default function userGroups(state = {}, action) {
    const newState = { ...state };
    switch (action.type) {
        case ActionTypes.UPDATE_USER_GROUPS:
            newState.userGroups = action.update;
            break;
        case ActionTypes.UPDATE_USER_GROUP:
            newState.userGroup = action.update;
            break;
        default:
    }

    return newState;
}

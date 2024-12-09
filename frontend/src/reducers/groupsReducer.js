import * as ActionTypes from '../constants/ActionTypes';

export default function groups(state = {}, action) {
    const newState = { ...state };
    switch (action.type) {
        case ActionTypes.UPDATE_ANONYMOUS_GROUP:
            newState.anonymousGroup = action.update;
            break;
        case ActionTypes.UPDATE_GROUP:
            newState.group = action.update;
            break;
        case ActionTypes.UPDATE_GROUPS:
            newState.groups = action.update;
            break;
        case ActionTypes.UPDATE_GROUPS_ALL:
            newState.groupsAll = action.update;
            break;
        case ActionTypes.UPDATE_GROUPS_ROWS_PER_PAGE:
            newState.rowsPerPage = action.update;
            break;
        case ActionTypes.UPDATE_GROUPS_PAGE:
            newState.page = action.update;
            break;
        default:
    }
    return newState;
}

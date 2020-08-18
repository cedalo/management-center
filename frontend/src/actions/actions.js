import * as ActionTypes from '../constants/ActionTypes';

export function updateSystemStatus(update){
    return {
        type: ActionTypes.UPDATE_SYSTEM_STATUS,
        update
    }
}

export function updateTopicTree(update){
    return {
        type: ActionTypes.UPDATE_TOPIC_TREE,
        update
    }
}
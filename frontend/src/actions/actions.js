import * as ActionTypes from '../constants/ActionTypes';

export function updateBrokerConnections(update){
    return {
        type: ActionTypes.UPDATE_BROKER_CONNECTIONS,
        update
    }
}

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
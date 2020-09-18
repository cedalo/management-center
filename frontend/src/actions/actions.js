import * as ActionTypes from '../constants/ActionTypes';

export function updateUsers(update){
    return {
        type: ActionTypes.UPDATE_USERS,
        update
    }
}

export function updateGroups(update){
    return {
        type: ActionTypes.UPDATE_GROUPS,
        update
    }
}

export function updateBrokerConfigurations(update){
    return {
        type: ActionTypes.UPDATE_BROKER_CONFIGURATIONS,
        update
    }
}

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

export function deletedUser(update){
    return {
        type: ActionTypes.DELETED_USER,
        update
    }
}
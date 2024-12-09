// access control functions to be overriden in user-management plugin if said plugin is installed
module.exports = {
    middleware: {
        isAdmin(request, response, next) {
            return next();
        },
        isEditor(request, response, next) {
            return next();
        },
        isViewer(request, response, next) {
            return next();
        },
        isConnectionManager(request, response, next) {
            return next();
        },
        isMonitoringViewer(request, response, next) {
            return next();
        },
        noRestrictedRoles(request, response, next) {
            return next();
        },
        allowConditions() {
            return (request, response, next) => {
                return next();
            };
        },
        checkConnectionAuthorized() {
            return (request, response, next) => {
                return next();
            };
        },
    },
    isAdmin(user) {
        return true;
    },
    isEditor(user) {
        return true;
    },
    isViewer(user) {
        return true;
    },
    isConnectionManager(user) {
        return true;
    },
    isMonitoringViewer(user) {
        return true;
    },
    noRestrictedRoles(user) {
        return true;
    },
    filterAllowedConnections(connections, allowedConnections) {
        return connections;
    },
    atLeastAdmin(user) {
        return true;
    },
    atLeastEditor(user) {
        return true;
    },
    atLeastViewer(user) {
        return true;
    },
    atLeastConnectionManager(user) {
        return true;
    },
    atLeastMonitoringViewer(user) {
        return true;
    },
    isConnectionAuthorized(user) {
        return true;
    },
    allowConditions() {
        return true;
    },
};

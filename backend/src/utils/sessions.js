const destroySession = (sessionStore) => (sessionId) =>
    new Promise((resolve) => sessionStore.destroy(sessionId, resolve));

const getAllSessions = (sessionStore) => new Promise((resolve) => sessionStore.all((_, sessions) => resolve(sessions)));

const collectOtherSessions =
    (sessionID, username) =>
    (all, [id, session]) => {
        if (id !== sessionID && session.passport?.user?.username === username) all.push(id);
        return all;
    };

const collectDestroyedSessions = (logger, sessions, username) => (all, res, index) => {
    if (res.status === 'fulfilled') all.push(sessions[index]);
    else logger.error(`Failed to destroy session for user: ${username}(${sessions[index]})`, res.reason);
    return all;
};

const destroyUserSessions = (plugin) => async (username, request) => {
    const { sessionStore, sessionID } = request;
    const sessions = await getAllSessions(sessionStore).catch((err) =>
        plugin.logger.error('Failed to get sessions!', err)
    );
    if (sessions) {
        const otherSessions = Object.entries(sessions).reduce(collectOtherSessions(sessionID, username), []);
        const results = await Promise.allSettled(otherSessions.map(destroySession(sessionStore)));
        return results.reduce(collectDestroyedSessions(plugin.logger, otherSessions, username), []);
    }
    return [];
};

const hasSession = (request) => {
    const { sessionStore, sessionID } = request;
    return !!sessionStore.sessions[sessionID];
};

const createSessionsDestroyedMessage = (sessionIDs) => ({
    type: 'event',
    event: {
        type: 'sessions-destroyed',
        payload: sessionIDs,
    },
});

module.exports = {
    createSessionsDestroyedMessage,
    destroyUserSessions,
    hasSession,
};

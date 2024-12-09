const BasePlugin = require('../../BasePlugin');
const { createActions } = require('./actions');
const meta = require('./meta');
const swagger = require('./swagger.js');

module.exports = class Plugin extends BasePlugin {
    constructor() {
        super(meta);
        this._swagger = swagger;
    }

    init(context) {
        const { router } = context;

        const { getProfileAction } = createActions(this);

        context.registerAction(getProfileAction);

        router.get(
            '/api/profile',
            // we need this wrapper becuse in some plugins like application-tokens we are going to redefine context.security.isLoggedIn, so we need it to be resolved dynamically via a wrapper
            (request, response, next) => context.security.isLoggedIn(request, response, next),
            context.middleware.isPluginLoaded(this),
            (request, response) => {
                const result = context.runAction(request.user, 'user-profile/get', null, { request });
                response.send(result);
            }
        );
    }
};

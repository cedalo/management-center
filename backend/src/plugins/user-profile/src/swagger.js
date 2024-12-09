module.exports = {
    tags: [
        {
            name: 'user-profile',
            description: 'User Profile API',
        },
    ],
    paths: {
        '/api/profile': {
            get: {
                tags: ['user-profile'],
                summary: 'Returns the profile of the currently logged in user.',
                produces: ['application/json'],
                responses: {
                    200: {
                        description: 'User profile object',
                    },
                },
            },
        },
    },
};

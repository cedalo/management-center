const preprocessUserFunctions = [];

const preprocessUser = async (request) => {
    for (const preprocessUserFunction of preprocessUserFunctions) {
        try {
            await preprocessUserFunction(request);
        } catch(error) {
            console.error('Error during user processing:', error);
            throw error;
        }
    }

    return request;
}


module.exports = {
    preprocessUserFunctions,
    actions: {
        middleware: {
            preprocessUser: async (request, response, next) => {
                try {
                    await preprocessUser(request);
                } catch(error) {
                    return next(error);
                }
        
                return next();
            }
        },
        preprocessUser

    },
};
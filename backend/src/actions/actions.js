const preprocessUserFunctions = [];

module.exports = {
    preprocessUserFunctions,
    actions: {
        preprocessUser: async (request, response, next) => {
            for (const preprocessUserFunction of preprocessUserFunctions) {
                try {
                    await preprocessUserFunction(request);
                } catch(error) {
                    console.error('Error during user processing:', error);
                    return next(error);
                }
            }
    
            return next();
        }
    }
};
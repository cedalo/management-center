const parse = require('content-type-parser');

module.exports = function contentTypeParser(request, response, next) {
    const contentType = parse(request?.headers?.accept);
    if (request) {
        request.contentType = contentType;
    }
    if (next) {
        next();
    }
};

const http = require('./http');

const restful = function (req, res, next, handlers) {
    const method = req.method.toLowerCase();

    if (!(method in handlers)) {
        return http.sendError(405, 'method not allowed');
    } else {
        handlers[method](req, res, next);
    }
};

module.exports = {
    restful
};
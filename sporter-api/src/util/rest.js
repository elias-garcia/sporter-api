const http = require('./http');

const restful = function (req, res, next, handlers) {
    const method = req.method.toLowerCase();

    if (!(method in handlers)) {
        res.status(405)
          .set('Allow', Object.keys(handlers).join(', ').toUpperCase())
          .json(http.createError(405, 'method not allowed'));
    } else {
        handlers[method](req, res, next);
    }
};

module.exports = {
    restful
};
'use strict';

module.exports =  function(req, res, next) {
    res.locals.flashMessages = req.session.flashMessages;
    req.session.flashMessages = [];
};
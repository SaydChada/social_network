'use strict';

module.exports =  function HasRole(role) {
    return function(req, res, next) {
        // TODO redirect to unAllowed route
        if (role !== req.user.role) {
            res.redirect();
        }
        else next();
    }
};
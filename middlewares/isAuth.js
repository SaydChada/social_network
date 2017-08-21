'use strict';

module.exports =  function(req, res, next) {
    if(!req.isAuthenticated()){
        console.log('no auth');
    }
    return next();
};
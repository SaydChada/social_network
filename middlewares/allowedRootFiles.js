'use strict';

module.exports =  function(req, res, next) {
    console.log('request', req.url);
    let allowedFiles = [
        '/robot.txt'
    ];

    if(~allowedFiles.indexOf(req.url)){
        return res.render(req.url);
    }
};
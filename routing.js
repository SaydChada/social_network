"use strict";

module.exports = function (app) {

    console.log('--- ROUTING STARTED ---');

    let flashKeepOnRedirect = require('./middlewares/flashKeepOnRedirect');
    let serverErrorHandler  = require('./app/routes/errors');
    let mainRouting         = require('./app/routes/main');

    app.socketIoStart =  require('./app/routes/websocket');

    // Main routing config aka default routing (/controller/action)
    app.use('/', mainRouting(app), serverErrorHandler, flashKeepOnRedirect);

};
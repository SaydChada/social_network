"use strict";

String.prototype.capitalize = function() {
    return this.charAt(0).toUpperCase() + this.slice(1);
};

module.exports = function (app){
    const express   = require('express');
    const router    = express.Router();
    const path      = require('path');

    router.all('/:controller?/:action?/:id?', function (request, response, next) {

        let modelName           = request.params.controller || 'homes';
        let requestController   = app.toControllerName(modelName);
        let requestAction       = request.params.action || 'index';

        request.params.controller   = requestController;
        request.params.action       = requestAction;
        request.params.model        = modelName;
        request.params.arg          = request.params.id;


        let controllerPath      = path.join('app', 'controllers', requestController );
        let controllerModule    = path.join('..', 'controllers', requestController );
        let controllerFile      = controllerPath + '.js';

        app.getController(controllerFile, function(err){

            if(err){
                console.log('--- CONTROLLER NOT FOUND : '+ controllerPath + ' ---');
                response.statusCode = 404;
                next(err);
            }
            else{
                console.log('--- CONTROLLER FOUND : ' + controllerPath + ' ---');

                let controller = new (require(controllerModule))(request, response, next, app);
                if(!controller.callAction(requestAction)){

                    response.statusCode = 404;
                    next( new Error('--- ACTION NOT FOUND : '+ requestAction +' ---'));
                }
            }
        });
    });

    return router;
};

'use strict';
const baseController = require('./baseController');

class ChatController extends baseController{
    constructor(req, res, next){
        super(req, res, next);
        this.viewDir = 'chat';

        this.authViews.user = ['index'];
    }

    indexAction(){

        this.viewVars.pageTitle = 'chat';
        this.render(this.view);
    }

}

module.exports = ChatController;




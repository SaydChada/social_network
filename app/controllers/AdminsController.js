'use strict';
const baseController = require('./baseController');

class AdminsController extends baseController{
    constructor(req, res, next){
        super(req, res, next);
        this.viewVars.defaultLayout   = 'adminLayout';
        this.viewDir = 'admins';

        this.authViews.admin = ['index', 'users'];
    }

    indexAction(){

        this.viewVars.pageTitle = 'index';
        this.render(this.view);
    }

}

module.exports = AdminsController;




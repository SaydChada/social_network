'use strict';
const baseController = require('./baseController');

class CommentsController extends baseController{
    constructor(req, res, next, app){
        super(req, res, next, app);
        this.viewDir = 'comments';

        this.authViews.user = ['index'];
    }

    indexAction(){
        let userModel = this.getModel('users');

        console.log(this.models['Users'].find);
        console.log(this.models['Users'].getMongooseModel().find);
        console.log(this.models['Users'].dbModel.find());

        this.viewVars.pageTitle = 'mes amis';
        this.render(this.view);
    }





}

module.exports = CommentsController;




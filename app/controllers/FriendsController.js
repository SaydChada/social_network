'use strict';
const baseController = require('./baseController');

class FriendsController extends baseController{
    constructor(req, res, next, app){
        super(req, res, next, app);
        this.viewDir = 'friends';

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



    friendslistAction(){

        this.getModel('users');
    }

    ajaxaddfriendAction(username){

        // Find user by username
        // send email (requestFriend)
        // display flash (partial flas_messages)
        // update bdd
    }

    ajaxacceptfriendAction(){

    }

    ajaxrejectfriendAction(){

    }

    ajaxrecommandfriendAction(){

    }




}

module.exports = FriendsController;




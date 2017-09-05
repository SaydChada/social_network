'use strict';
const baseController = require('./baseController');

class FriendsController extends baseController{
    constructor(req, res, next, app){
        super(req, res, next, app);
        this.viewDir = 'friends';

        this.authViews.user = ['index','add','delete'];
    }

    indexAction(){
        let userModel = this.getModel('users');

        //TODO récuperer liste amis, list users non amis,
        // list recommandation

        console.log(this.models['Users'].find);
        console.log(this.models['Users'].getMongooseModel().find);
        console.log(this.models['Users'].dbModel.find());

        this.viewVars.pageTitle = 'mes amis';
        this.render(this.view);
    }

    /**
     * Handle ajax add friend action
     * @returns {*}
     */
    addAction(){

        // Init response data object
        let data = {
            templateFlash : null,
            statusCode : 200,
            err: null
        };

        if(this.req.method !== 'POST'){
            data.err = 'Method not allowed';
            data.statusCode = 405;
            return this.render(null, data, 'json');
        }

        let currentUserId = this.req.user._id;
        let requestUserId = this.req.body.target;

        let newFriend = {
            userId      : requestUserId,
            status      : 'invitation en cours',
            requestAt   :  new Date(),
        };

        let newFriendRequest = {
            userId      : currentUserId,
            status      : 'en attente de confirmation',
            requestAt   :  new Date(),
        };

        let userModel = this.getModel('users');

        async.waterfall([
                (done) => {
                    userModel.getMongooseModel().findOneAndUpdate({_id : currentUserId}, {$push: { friends: newFriend }},(err, sender) => {
                        done(err, sender);
                    })
                },
                (sender, done) => {

                    userModel.getMongooseModel().findOneAndUpdate({_id : requestUserId}, {$push: { friends: newFriendRequest }},(err, receiver) => {
                        done(err, sender, receiver);
                    })
                },
                (sender, receiver, done) => {

            console.log('SENDER' , sender);
            console.log('RECEIVER' , receiver);
                    let mailVars = {
                        senderUser: sender,
                        receiverUser : receiver,
                        subject: this.req.app.locals.website + ':: Demande ami',
                        title : 'Nouvelle demande d\'ami',
                        from: this.req.app.locals.adminEmail,
                        target: receiver.email
                    };

                    this.sendMailView('email/requestFriend', mailVars, (err, response) => {
                        done(err);
                    });

                },
                (done) => {

                    let flashMessage = {type : 'success', message: 'Demande d\'ami envoyée'};
                    let templateData = {flashMessages : [flashMessage], layout : false};
                    this.app.render('partials/flash_messages', templateData, (err, flashTemplate) => {
                        data.templateFlash = flashTemplate;
                        return this.render(null, data, 'json');
                    });
                }
            ],
            (err) => {

                console.log(err);
                data.statusCode = 500;
                data.err = err;
                let flashMessage = {type : 'danger', message: 'Erreur,impossible d\'ajouter ami!'};
                let templateData = {flashMessages : [flashMessage], layout : false};
                this.app.render('partials/flash_messages', templateData, (err, flashTemplate) => {
                    data.templateFlash = flashTemplate;
                    return this.render(null, data, 'json');
                });

            });
    }

    acceptAction(){

    }

    deleteAction(){

    }

    ajaxrecommandfriendAction(){

    }




}

module.exports = FriendsController;




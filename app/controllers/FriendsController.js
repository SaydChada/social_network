'use strict';
const baseController = require('./baseController');

class FriendsController extends baseController{
    constructor(req, res, next, app){
        super(req, res, next, app);
        this.viewDir = 'friends';

        this.authViews.user = ['index', 'add', 'delete', 'recommend', 'delete', 'confirmed'];
    }

    indexAction(){
        let userModel = this.getModel('users');

        // aggregate friends based on status
        userModel.getMongooseModel().aggregate([
            {$match: { username: this.req.user.username} },
            {$project: { _id: 0, username: 1, friends: 1 } },
            {$unwind: "$friends" },
            {$sort: {'friends.username' : 1}},
            {$group: { _id : "$friends.status", users : {$push : '$friends'} }},
            {$sort: {_id : 1}}

        ],  (err, data) => {
            if (err) {
                console.log(err);
            }

            this.viewVars.confirmed = data[0];
            this.viewVars.received = data[1];
            this.viewVars.sent = data[2];
            this.viewVars.recommended = data[3];
        });

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

        let userModel = this.getModel('users');

        async.waterfall([
                (done) => {

                    // Target user invitation
                    let newFriendRequest = {
                        userId      : this.req.user._id,
                        status      : 'en attente de confirmation',
                        userName    : this.req.user.username,
                        requestAt   :  new Date(),
                    };

                    userModel.getMongooseModel().findOneAndUpdate(
                        {_id : this.req.body.target},
                        {$push: { friends: newFriendRequest }},
                        (err, receiver) => {
                            done(err, receiver);
                        })
                },
                (receiver, done) => {

                    // Request invitation
                    let newFriend = {
                        userId      : this.req.body.target,
                        status      : 'invitation en cours',
                        username    : receiver.username,
                        requestAt   :  new Date(),
                    };

                    userModel.getMongooseModel().findOneAndUpdate(
                        {_id : this.req.user._id},
                        {$push: { friends: newFriend }},
                        (err, sender) => {
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

    /**
     * Handle ajax accept invitation
     */
    acceptAction(){

        let data = {
            templateFlash : null,
            statusCode : 200,
            err: null
        };

        if(this.req.method !== 'PUT'){
            data.err = 'Method not allowed';
            data.statusCode = 405;
            return this.render(null, data, 'json');
        }

        let userModel = this.getModel('users');
        let userToRemove = this.req.body.userId;

        userModel.update({_id: this.req.user._id, 'friends.$.userId' : userToRemove},
            {$set : {'friends.$.status' : 'confirmé'}},
            (err, result) => {
                if(err){
                    data.err = 'Internal error server';
                    data.statusCode = 500;
                    throw err;
                }

                userModel.update({_id: userToRemove, 'friends.$.userId': this.req.user._id},
                    {$set : {'friends.$.status' : 'confirmé'}},
                    (err, result) => {
                        if(err){
                            data.err = 'Internal error server';
                            data.statusCode = 500;
                            throw err;
                        }

                        let flashMessage = {type : 'success', message: 'Ami accepté'};
                        let templateData = {flashMessages : [flashMessage], layout : false};
                        this.app.render('partials/flash_messages', templateData, (err, flashTemplate) => {
                            data.templateFlash = flashTemplate;
                            return this.render(null, data, 'json');
                        });
                    })

            });



    }

    /**
     * Handle ajax remove user from friends
     * @returns {*}
     */
    deleteAction(){

        let data = {
            templateFlash : null,
            statusCode : 200,
            err: null
        };

        if(this.req.method !== 'DELETE'){
            data.err = 'Method not allowed';
            data.statusCode = 405;
            return this.render(null, data, 'json');
        }

        let userModel = this.getModel('users');
        let userToRemove = this.req.body.userId;

        userModel.update({_id: this.req.user._id, 'friends.$.userId' : userToRemove},
            {$unset : {'friends.$' : ''}},
            (err, result) => {
                if(err){
                    data.err = 'Internal error server';
                    data.statusCode = 500;
                    throw err;
                }

                userModel.update({_id: userToRemove, 'friends.$.userId': this.req.user._id}, {$unset : {'friends.$' : ''}},
                    (err, result) => {
                        if(err){
                            data.err = 'Internal error server';
                            data.statusCode = 500;
                            throw err;
                        }

                        let flashMessage = {type : 'success', message: 'Ami retiré'};
                        let templateData = {flashMessages : [flashMessage], layout : false};
                        this.app.render('partials/flash_messages', templateData, (err, flashTemplate) => {
                            data.templateFlash = flashTemplate;
                            return this.render(null, data, 'json');
                        });
                    })

            });

    }

    /**
     * Ajax handler method recommend friend
     * @returns {*}
     */
    recommendAction(){

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

        // Init vars
        // here currentUser is not session user, he's the target of the recommendation
        let currentUID = this.req.body.currentUserId ;
        let targetUID = this.req.body.targetUserId;
        let userModel = this.getModel('users');
        let fieldUser = {username: 1, lastName: 1, firstName: 1, email: 1};
        let currentUser, targetUser;

        async.waterfall([
                (done) => {
                    // Find currentUID
                    userModel.findOne({_id : currentUID}, (err, cUser) => {
                        if(err){
                            done(err);
                        }
                        currentUser = cUser;

                        // and targetUID
                        userModel.findOne({_id: targetUID},(err, tUser) => {
                            if(err){
                                done(err);
                            }
                            targetUser = tUser;

                            done();
                        }, fieldUser);
                    }, fieldUser);
                },
                (done) => {



                    // Recommended user data
                    let targetFriend = {
                        userId        : currentUser._id,
                        recommendedBy : this.req.user._id,
                        recommendedByUsername : this.req.user.username,
                        status        : 'recommandé',
                        userName      : currentUser.username,
                        requestAt     :  new Date(),
                    };

                    // Target of recommendation
                    let newRecommendation = {
                        userId        : targetUser._id,
                        recommendedBy : this.req.user._id,
                        recommendedByUsername : this.req.user.username,
                        status        : 'invitation en cours',
                        userName      : targetUser.username,
                        requestAt     :  new Date(),
                    };

                    // Add friend to both recommended user and target or recom
                    userModel.update(
                        {_id : currentUser._id},
                        {$push: { friends: newRecommendation }},
                        (err, count) => {
                            if(err){
                                done(err);
                            }

                            userModel.update(
                                {_id : targetUser._id},
                                {$push: { friends: targetFriend }},
                                (err, count) => {
                                    if (err) {
                                        done(err);
                                    }

                                    done();
                                });
                        })
                },
                (done) => {

                    let mailVars = {
                        senderUser          : currentUser,
                        receiverUser        : targetUser,
                        recommenderUser     : this.req.user,
                        subject             : this.req.app.locals.website + ':: Recommendation ami',
                        title               : 'Nouvelle recommandation d\'ami',
                        from                : this.req.app.locals.adminEmail,
                        target              : currentUser.email
                    };

                    // Send email to target of recomm
                    this.sendMailView('email/friendRecommandation', mailVars, (err, response) => {
                        done(err);
                    });
                },
                (done) => {

                    // Done with success show flash message
                    let flashMessage = {type : 'success', message: 'Recommandation d\'ami envoyée'};
                    let templateData = {flashMessages : [flashMessage], layout : false};
                    this.app.render('partials/flash_messages', templateData, (err, flashTemplate) => {
                        data.templateFlash = flashTemplate;
                        return this.render(null, data, 'json');
                    });
                }
            ],
            (err) => {

                // error durring waterfall async workflow display error
                console.log(err);
                data.statusCode = 500;
                data.err = err;
                let flashMessage = {type : 'danger', message: 'Erreur,impossible de recommander ami!'};
                let templateData = {flashMessages : [flashMessage], layout : false};
                this.app.render('partials/flash_messages', templateData, (err, flashTemplate) => {
                    data.templateFlash = flashTemplate;
                    return this.render(null, data, 'json');
                });

            });
    }

    /**
     * Ajax method handle list in confirmed user
     */
    confirmedlistAction(){

        let userModel = this.getModel('users');

        let query =  this.req.body.query;
        query = new RegExp('^' + query, 'gi');

        let currentUserFriends = this.req.body.currentFriends;
        let ignoreIds = [];

        if(currentUserFriends && currentUserFriends instanceof Array){
            ignoreIds = currentUserFriends.map(function(friend){
                return friend.userId;
            });
        }


        userModel.getMongooseModel().aggregate([
            {$match: { username: this.req.user.username} },
            {$project: { _id: 1, 'friends.username': 1, 'friends.userId' : 1, 'friends.status' : 1 } },
            {$unwind : '$friends'},
            {$match: {'friends.username' : query, 'friends.status' : 'confirmé', 'friends.userId' : {$nin : ignoreIds}}},
            {$sort: {'friends.username' : 1}},
            {$group: {'_id': '$_id', 'confirmedFriends': {$push: '$friends'}}}


        ],  (err, data) => {
            if (err) {
                throw (err);
            }

            let returnData = [];

            if(data[0] && data[0].confirmedFriends){
                returnData = data[0].confirmedFriends;
            }


            this.render(null, returnData, 'json');
        });

    }




}

module.exports = FriendsController;




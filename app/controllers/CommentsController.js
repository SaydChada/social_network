'use strict';
const baseController = require('./baseController');

class CommentsController extends baseController{
    constructor(req, res, next, app){
        super(req, res, next, app);
        this.viewDir = 'comments';

        this.authViews.user = ['index', 'delete'];
    }

    /**
     * Handle ajax save message
     * @returns {*}
     */
    addAction(){

        // Init response data object
        let data = {
            templateFlash : null,
            templateComment : null,
            statusCode : 200,
            err: null
        };

        if(this.req.method !== 'POST'){
            data.err = 'Method not allowed';
            data.statusCode = 405;
            return this.render(null, data, 'json');
        }


        let newCom = {
            createdBy: this.req.user._id,
            targetUser : this.req.body.target,
            content:  this.req.body.message ,
        };

        async.waterfall([
            (done) => {
                this.model.insert(newCom,(err, comment) => {
                   done(err, comment);
                })
            },
            (comment, done) => {
                this.model.findComment(comment._id, (err, comment) =>{
                    done(err, comment);
                });
            },
            (comment, done) => {

                // Send email
                if(comment.createdBy.id !== comment.targetUser.id){

                    let mailVars = {
                        username: comment.createdBy.username,
                        title : 'Nouveau commentaire',
                        from: this.req.app.locals.adminEmail,
                        target: omment.targetUser.email
                    };

                    this.sendMailView('email/new_comment', mailVars, (err, response) => {
                        done(err,comment);
                    });
                }else{
                    done(null, comment);
                }

            },
            (comment, done) => {
                comment.layout = false;
                this.app.render('users/partials/block_comment', comment,  (err, commentTemplate) => {
                    data.templateComment = commentTemplate;
                    done(err);
                });
            },
            (done) => {

                let flashMessage = {type : 'success', message: 'Votre commentaire a été enregistré'};
                let templateData = {flashMessages : [flashMessage], layout : false};
                this.app.render('partials/flash_messages', templateData, (err, flashTemplate) => {
                    data.templateFlash = flashTemplate;
                    return this.render(null, data, 'json');
                });
            }
        ], (err) => {

            data.statusCode = 500;
            data.err = err;
            let flashMessage = {type : 'danger', message: 'Erreur, commentaire non sauvegardé'};
            let templateData = {flashMessages : [flashMessage], layout : false};
            this.app.render('partials/flash_messages', templateData, (err, flashTemplate) => {
                data.templateFlash = flashTemplate;
                return this.render(null, data, 'json');
            });

        });

    }

    /**
     * Handle ajax delete message
     * @returns {*}
     */
    deleteAction(){

        let data = {
            templateFlash : null,
            templateComment : null,
            statusCode : 200,
            err: null
        };

        if(this.req.method !== 'DELETE'){
            data.err = 'Method not allowed';
            data.statusCode = 405;
            return this.render(null, data, 'json');
        }

        let commentId = this.req.body.id;
        let userId = this.req.user._id;

        //Pull comment from db if associated with currentUser
        this.model.findOne({_id: commentId, createdBy : userId}, (err, comment) => {

            if(err){
                throw err;
            }
            // Then delete comment
            comment.remove({ _id: commentId},  (err) => {
                if (err){
                    throw err;
                }
                return this.render(null, data, 'json');
            });

        });

    }





}

module.exports = CommentsController;




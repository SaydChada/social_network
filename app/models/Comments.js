'use strict';
const baseModel = require('./baseModel');

/**
 * Comments model
 */
class Comments extends baseModel{

    /**
     * Call parent and define schema
     */
    constructor(){
        super('comments');

        let Schema = this.db.Schema;
        this.schema = new Schema({
            content     : String,
            targetUser  : {type : Schema.Types.ObjectId, ref: 'users'},
            createdBy   : {type: Schema.Types.ObjectId, ref : 'users'},
            created     : { type: Date, default: Date.now }
        });

    }


    findComments(userId, callback){

        this.getMongooseModel().find({targetUser : userId},null, {sort: {created : -1}}).populate({
            path: 'createdBy',
            model: 'users',
            select: {
                username: 1,
                firstName: 1,
                lastName: 1
            }
        }).exec(callback);
    }

    findComment(commentId, callback){
        this.getMongooseModel().findOne({_id : commentId}, null, {sort: {created : -1}}).populate({
            path: 'createdBy',
            model: 'users',
            select: {
                username: 1,
                firstName: 1,
                lastName: 1,
                email: 1,
            }
        }).populate({
            path: 'targetUser',
            model: 'users',
            select: {
                username: 1,
                firstName: 1,
                lastName: 1,
                email: 1,
            }
        })
            .exec(callback);
    }

}


module.exports = new Comments();
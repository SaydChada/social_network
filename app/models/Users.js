'use strict';
const baseModel = require('./baseModel');
const passportLocalMongoose = require('passport-local-mongoose');

/**
 * User model
 */
class Users extends baseModel{

    /**
     * Call parent and define schema, plus enable passeport plugin
     */
    constructor(){
        super('users');

        let Schema = this.db.Schema;
        this.schema = new Schema({
            username    : String,
            email       : String,
            status      : { type: String, default: 'Hors ligne'},
            password    : String,
            socketId    : String,
            games       : [{ type: Schema.Types.ObjectId, ref: 'games' }],
            total_score : {type : Number, default : 0},
            created     : { type: Date, default: Date.now }
        });

        this.schema.plugin(passportLocalMongoose, {hashField : 'password'});

    }


    /**
     * Retrieve online users excluding current user
     * @param cb
     */
    getOnlineUsers(cb){
        let currentUser = this.controller.req.user._id;
        this.getMongooseModel().find({ _id : {$ne : currentUser}, status : {$ne : 'Hors ligne'}}, cb);
    }
}


module.exports = new Users();
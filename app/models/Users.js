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
            username: { type: String, required: true, unique: true },
            email: { type: String, required: true, unique: true },
            password: { type: String, required: true },
            resetPasswordToken: String,
            resetPasswordExpires: Date,
            role        : String,
            socketId    : String,
            gender      : String,
            age         : Number,
            description : {type: String, min: 10, max: 100},
            preferences : Object,
            avatar      : String,
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
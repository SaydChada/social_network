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
            username: { type: String, required: true },
            firstName: { type: String, required: true },
            lastName: { type: String, required: true },
            email: { type: String, required: true, unique: true },
            password: { type: String, required: true },
            resetPasswordToken: String,
            resetPasswordExpires: Date,
            role        : String,
            socketId    : String,
            gender      : String,
            birthdate   : Date,
            description : {type: String, min: 10, max: 100},
            preferences : Object,
            avatar      : String,
            friends     : [Object],
            created     : { type: Date, default: Date.now }
        },{
            toObject: {
                virtuals: true
            },
            toJSON: {
                virtuals: true
            }
        });

        this.schema.plugin(passportLocalMongoose, {hashField : 'password'});



        this.schema.virtual('name')
            .get(function () {
                return `${this.username} (${this.firstName} ${this.lastName})`;
            });


        // Set default avatar if not set by user
        this.schema.post('init', function(doc) {
            if(!doc.avatar){
                doc.avatar = '/js/dist/tapatar/img/default.svg';
            }
        });
    }


    /**
     * Retrieve online users excluding current users
     * @param cb
     */
    getOnlineUsers(cb){
        let currentUser = this.controller.req.user._id;
        this.getMongooseModel().find({ _id : {$ne : currentUser}, status : {$ne : 'Hors ligne'}}, cb);
    }
}


module.exports = new Users();
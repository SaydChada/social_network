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
            friends     : Array,
            created     : { type: Date, default: Date.now }
        },{
            toObject: {
                virtuals: true
            },
            toJSON: {
                virtuals: true
            }
        });

        this.schema.plugin(passportLocalMongoose, {hashField : 'password', limitAttempts: true});



        this.schema.virtual('name')
            .get(function () {
                if(this.username && this.firstName && this.lastName){
                    return `${this.username} (${this.firstName} ${this.lastName})`;
                }else{
                    return undefined;
                }
            });

        // Set default avatar if not set by user
        this.schema.post('init', function(doc) {
            if(!doc.avatar){
                doc.avatar = '/js/dist/tapatar/img/default.svg';
            }
        });


        this.dbModel = this.db.model(this.document, this.schema);

    }


    getByUserName(username, callback){
        let excludeFields = {
            email: -1,
            password: -1,
            resetPasswordToken: -1,
            resetPasswordExpires: -1,
            role        : -1,
            socketId    : -1,
        };
        //query, callback, projection, option
        this.findOne({username : username},excludeFields, (err, user) => {
            if(err){
                throw err;
            }

            callback(err, user);

        })
    }

}


module.exports = new Users();
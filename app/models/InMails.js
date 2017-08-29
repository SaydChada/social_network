'use strict';
const baseModel = require('./baseModel');

/**
 * inMails model
 */
class InMails extends baseModel{

    /**
     * Call parent and define schema
     */
    constructor(){
        super('in_mails');

        let Schema = this.db.Schema;
        this.schema = new Schema({
            sender    : {type : Schema.Types.ObjectId, ref : 'Users'},
            target    : {type: Schema.types.ObjectId, ref : 'Users'},
            replyTo   : {type : Schema.Types.ObjectId, default : null, ref : 'InMails'},
            title     : String,
            content   : String,
            readAt    : Date,
            deletedAt : Date,
            createdAt : { type: Date, default: Date.now }
        });
    }

}


module.exports = new InMails();
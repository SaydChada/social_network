'use strict';
const baseModel = require('./baseModel');

/**
 * iMails model
 */
class IMails extends baseModel{

    /**
     * Call parent and define schema
     */
    constructor(){
        super('imails');

        let Schema = this.db.Schema;
        this.schema = new Schema({
            sender    : {type : Schema.Types.ObjectId, ref : 'Users'},
            target    : {type: Schema.Types.ObjectId, ref : 'Users'},
            replyTo   : {type : Schema.Types.ObjectId, default : null, ref : 'InMails'},
            title     : String,
            content   : String,
            readAt    : Date,
            deletedAt : Date,
            createdAt : { type: Date, default: Date.now }
        });
    }

}


module.exports = new IMails();
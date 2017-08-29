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
            post        : {type : Schema.Types.ObjectId, ref: 'Posts'},
            createdBy   : {type: Schema.Types.ObjectId, ref : 'Users'},
            created     : { type: Date, default: Date.now }
        });
    }

}


module.exports = new Comments();
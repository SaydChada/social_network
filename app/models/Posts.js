'use strict';
const baseModel = require('./baseModel');

/**
 * Posts model
 */
class Posts extends baseModel{

    /**
     * Call parent and define schema
     */
    constructor(){
        super('posts');

        let Schema = this.db.Schema;
        this.schema = new Schema({
            slug        : String,
            createdBy   : {type: Schema.Types.ObjectId, ref: 'Users'},
            title       : String,
            description : String,
            total_comments: {type: Number, default: 0},
            created     : { type: Date, default: Date.now }
        });
    }

}


module.exports = new Posts();
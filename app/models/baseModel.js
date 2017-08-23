'use strict';

/**
 * Base class for models which have to extends this one
 */
class baseModel{

    /**
     *
     * @param document : string | bdd document name
     */
    constructor(document){
        this.db         = dbConnection;
        this.controller = null;
        this.document   = document;
    }

    /**
     * Return mongoose model
     * @returns {*|Aggregate|Model}
     */
    getMongooseModel(){
        if(!this.schema){
            throw new Error('Schema must be defined in children classes');
        }
        return this.db.model(this.document, this.schema);
    }

    find(query, callback, projection, options){
         this.getMongooseModel().find(query, projection, options, callback);
    }

    findOne(query, callback, projection, options){
        this.getMongooseModel().findOne(query, projection, options, callback)
    }

    update(query, update, callback, options){
        this.getMongooseModel().update(query, update, options, callback);
    }

    insert(query, callback, options){
        this.getMongooseModel().insert(query, callback);
    }

    remove(query, callback){
        this.getMongooseModel().remove(query, callback);
    }

}

module.exports = baseModel;
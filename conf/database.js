'use strict';

/**
 * Define database configuration
 * @type {{host: string, port: string, protocol: string, database: string, url: module.exports.url}}
 */
module.exports = {
    host            : 'localhost',
    port            : '27017',
    protocol        : 'mongodb',
    database        : 'social',
    url             : function(){
        return this.protocol + '://' + this.host +':' + this.port + '/' + this.database;
    }
};
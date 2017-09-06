'use strict';

/**
 *  Define local vars for the full app
 * @type {{env: string, website: string, adminEmail: string, currentYear: number}}
 */
module.exports = {
    env             : "dev",
    server          : require('./server'),
    website         : "LinkedCats",
    adminEmail      : "chadasaid78@gmail.com",
    currentYear     : (new Date()).getFullYear()
};
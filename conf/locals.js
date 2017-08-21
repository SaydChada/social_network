'use strict';

/**
 *  Define local vars for the full app
 * @type {{env: string, website: string, adminEmail: string, currentYear: number}}
 */
module.exports = {
    env             : "dev",
    server          : require('./server'),
    website         : "LinkedCats",
    adminEmail      : "contact@chadasaid.net",
    currentYear     : (new Date()).getFullYear()
};
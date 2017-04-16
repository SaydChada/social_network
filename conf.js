'use strict';

/**
 * try catch for securised config (never push password, hash key etc ... to git)
 */
let mailConfig;
let secretsConfig;
try{
    mailConfig =  require.resolve('./conf/mail') && module.require('./conf/mail');
    secretsConfig = require.resolve('./conf/secrets') && module.require('./conf/secrets')
}catch(err){

}

/**
 * Here all config files are loaded
 * @type {{locals: (*), env: (*), hbs: (*), bdd: (*), server: (*), secrets: (*), mail: (*), passport: (*)}}
 */
module.exports = {
    locals   : module.require('./conf/locals'),
    env      : process.env["NODE_ENV"] || 'dev',
    hbs      : module.require('./conf/handlebars'),
    bdd      : module.require('./conf/database'),
    server   : module.require('./conf/server'),
    secrets  : secretsConfig || module.require('./conf/secrets.dist.js'),
    mail     : mailConfig,
    passport : module.require('./conf/passport')
};
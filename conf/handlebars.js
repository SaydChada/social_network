'use strict';

/**
 * Define handlebars configuration
 * @type {{extname: string, partialsDir: string, layoutsDir: string, defaultLayout: string}}
 */
module.exports = {
    extname         : '.hbs',
    // Here specify every partials dirs
    partialsDir     : [
        './app/views/partials/',
        './app/views/friends/partials/',
        './app/views/users/partials/',
        './app/views/partials/front/',

    ],
    layoutsDir      : './app/views/layouts/',
    defaultLayout   : 'frontLayout'
};
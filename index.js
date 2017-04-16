'use strict';
/**
 * This is the entry point
 */
const config = require('./conf');
const app = require('./app');
const routing = require('./routing');

app(routing, config);






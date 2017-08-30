/**
 * Main app here express dependencies are set and server is started
 * @param routing callback router to handle route app
 * @param localConf object with server, bdd and other conf
 */
function init(routing, localConf){
    "use strict";

// Dependencies modules
    const http           = require('http');
    const cors           = require('cors');
    const multer         = require('multer');
    const express        = require('express');
    const expressSession = require('express-session');
    const cookieParser   = require('cookie-parser');
    const bodyParser     = require('body-parser');
    const passport       = require('passport');
    const LocalStrategy  = require('passport-local').Strategy;
    const path           = require('path');
    const methodOverride = require('method-override');
    const fs             = require('fs');
    const handlebars     = require('express-handlebars');
    const MongoStore     = require('connect-mongo')(expressSession);
    const mongoose       = require('mongoose');
    mongoose.Promise = global.Promise;
    const app            = express();

// Express config

    app.use( cookieParser(localConf.secrets.cookie) );
    app.use( express.Router() );
    app.use(bodyParser.json({limit: '50mb'}));
    app.use(bodyParser.urlencoded({limit: '50mb', extended: true}));
    app.disable('x-powered-by');
    app.use( methodOverride('_method') );
    app.use(cors());
    app.locals = localConf.locals;

// View configuration

    // Set directories
    app.set( 'views', path.join( __dirname,'app', 'views' ) );
    app.set('layouts', path.join( app.get('views'), 'layouts'));
    app.use( '/', express.static( path.join( __dirname, 'app', 'public' ) ) );

    // Configure handlebars && Set as default engine, merge with global helpers
    let hbsConf = Object.assign({helpers : require('./app/views/helpers/global')}, localConf.hbs);
    app.engine('hbs', handlebars(hbsConf));
    app.set('view engine', 'hbs');
    app.enable('view cache');

    // global vars
    global.dbConnection = mongoose.connect(localConf.bdd.url());
    global.moment = require('moment');
    global.async  = require('async');
    global.crypto = require('crypto');
    global.mkdirp = require('mkdirp');
    global.slugify = require('slugify');

    // Session config
    let session = expressSession({
        secret: localConf.secrets.session,
        store: new MongoStore({
            mongooseConnection: mongoose.connection,
            autoRemove: 'native', // Clean session in bdd
            touchAfter: 12 * 3600 // Resave session only after 12 hours
        }),
        saveUninitialized : false, // Dont save session on initialisation
        resave: false,  // Dont resave every time client refresh
        cookie: { secure: false,/* maxAge : 24 * 60 * 60*/ }
    });
    app.use(session);

// Passeport configuration
    app.use(passport.initialize());
    app.use(passport.session());
    let Account = (require('./app/models/Users')).getMongooseModel();
    passport.use(new LocalStrategy(Account.authenticate()));
    passport.serializeUser(localConf.passport.serializeStrategy);
    passport.deserializeUser(localConf.passport.serializeStrategy);

// Mailer configuration
    if(localConf.mail){
        const nodemailer = require('nodemailer');
        global.mailTransporter = nodemailer.createTransport(localConf.mail);
    }


    /**
     * Server start then routing then socket.io init
     */
    http.createServer(app).listen(localConf.server.port, null, function() {

        console.log('--- SERVER START --- AT',localConf.server.port, localConf.server.host );
        routing(app);
    });


    /**
     * Check if controler file exist && accessible
     * @param controllerName
     * @param callback
     */
    app.getController = function(controllerName, callback){
        fs.access( controllerName, function(err){
            callback(err);
        });
    };

    /**
     * function to get Controller's name
     * @param controller
     * @returns {string}
     */
    app.toControllerName = function(controller){
        return controller.charAt(0).toUpperCase() + controller.slice(1) + 'Controller';
    }

}

module.exports = init;
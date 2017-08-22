'use strict';

const baseController = require('./baseController');

class UsersController extends baseController{

    constructor(req, res, next){
        super(req, res, next);
        this.viewDir = 'users';
    }

    registerAction(){
        if(this.req.method ==='POST'){
            let data = this.req.body;
            if(data){

                let user = {
                    username : data.username,
                    description: data.description,
                    email : data.email,
                    password : data.password,
                    gender : data.gender[0],
                    birthdate: moment(data.birthdate, 'DD/MM/YYY').toDate()
                };
                this.register(user);
            }
            // No username or login
            else{
                this.req.flash('danger', '-- Formulaire invalide --');
                this.render(this.view , this.viewVars);
            }
        }
        // Not post resend view
        else{
            let userModel = this.model;

            userModel.find( (err, users) => {
                if (err) {
                    throw err;
                }
                this.viewVars.users = users;
                this.viewVars.user = this.req.user;
                this.viewVars.formTitle = 'Inscription';
                this.viewVars.pageTitle = 'Inscription';
                this.render(this.view , this.viewVars);
            });

        }

    }

    /**
     * Handle login
     */
    loginAction(){
        this.viewVars.formTitle = 'Connexion';
        this.viewVars.pageTitle = 'Connexion';
        this.viewVars.urlForgotPassword = 'forgot';

        if(this.req.method ==='POST'){
            this.passport.authenticate('local', this.login.bind(this))(this.req, this.res, this.next);
        }else{
            return this.render(this.view, this.viewVars);
        }

    }

    /**
     * Handle forgot pass
     * @returns {*}
     */
    forgotAction(){

        this.viewVars.formTitle = 'Mot de passe oublié';
        this.viewVars.pageTitle = 'Oublie';
        this.viewVars.urlLogin = 'login';

        if(this.req.method ==='POST'){
            this.forgot.call(this);
        }else{
            return this.render(this.view, this.viewVars);
        }
    };

    logoutAction(){
        this.req.logout();
        // Destroying session also destroy flash messages lulz
        // this.req.session.destroy();
        this.viewVars.flashMessages.push({
            type: 'info',
            message: 'Déconnexion réussie !'
        });
        this.res.redirect('/');
    }

    resetAction(){

        this.viewVars.formTitle = 'Nouveau mot de passe';
        this.viewVars.pageTitle = 'Nouveau mdp';
        if(this.req.method === 'POST'){

            let data = this.req.body;

            if(data.password === data.confirm){
                this.reset.call(this);
            }else{
                this.viewVars.flashMessages.push({
                    type: 'danger',
                    message: 'Mauvaise confirmation du mot de passe !'
                });

                return this.res.redirect('back');
            }


        }else{
            this.model.findOne(
                { resetPasswordToken: this.req.params.id, resetPasswordExpires: { $gt: Date.now() } },
                (err, user) => {
                    console.log(user);
                    if (!user) {
                        this.viewVars.flashMessages.push({
                            type: 'danger',
                            message: 'Token reset mot de passe invalide !'
                        });
                        return this.res.redirect('/users/forgot');
                    }
                    return this.render('reset', this.viewVars);
                });
        }
    }



    /**
     * Handle registrationCallback
     * @param data
     */
    register(data){
        let userModel = this.getModel('users').getMongooseModel();
        userModel.register(new userModel(data), data.password, (err, account) => {
            if (err) {
                throw err;
            }

            this.passport.authenticate('local')(this.req, this.res, () => {
                this.viewVars.flashMessages.push({
                    type: 'warning',
                    message: 'Merci pour votre inscription, vous êtes connecté !'
                });
                this.res.redirect('/');
            });
        });
    }

    /**
     * Handle logincallback
     * @param err
     * @param user
     * @param info
     * @returns {*}
     */
    login(err, user, info){
        if (err) {
            return this.next(err);
        }
        if (!user) {

            this.viewVars.flashMessages.push({
                type: 'danger',
                message: 'Login / mot de passe incorrects !'
            });

            return this.render(this.view);
        }
        this.req.logIn(user, (err) => {
            if (err) {
                return this.next(err);
            }

            this.viewVars.flashMessages.push({
                type: 'info',
                message: 'Connexion réussie !'
            });

            return this.res.redirect('/');
        });
    }

    /**
     * Handle forgot pass submit
     */
    forgot(){
        let data = this.req.body;
        async.waterfall([
            (done) => {
                crypto.randomBytes(20, function(err, buf) {
                    let token = buf.toString('hex');
                    done(err, token);
                });
            },
            (token, done) => {
                this.model.findOne({ email: data.email }, (err, user) => {
                    if (!user) {
                        this.viewVars.flashMessages.push({
                            type: 'danger',
                            message: 'Pas de compte éxistant avec cet email !'
                        });
                        return this.res.redirect('forgot');
                    }

                    user.resetPasswordToken = token;
                    user.resetPasswordExpires = Date.now() + 3600000; // 1 hour

                    user.save(function(err) {
                        done(err, token, user);
                    });
                });
            },
            (token, user, done) => {

                data.title = 'Mot de passe oublié';
                data.from = this.req.app.locals.adminEmail;
                data.target = data.from;
                data.link = this.req.headers.host + '/users/reset/' + token;

                this.sendMailView('email/forgot', data, (err, response) => {

                    if(err){
                        throw err;
                    }

                    this.viewVars.flashMessages.push({
                        type: 'success',
                        message: 'Merci, Un email vous a été envoyé !'
                    });

                    this.render('forgot');
                });
            }
        ], (err) => {
            if (err) return next(err);
            this.res.redirect('forgot');
        });
    }

    /**
     * Handle reset post form
     */
    reset(){
        async.waterfall([
            (done) => {

                this.model.findOne(
                    { resetPasswordToken: this.req.params.id, resetPasswordExpires: { $gt: Date.now() } },
                    (err, user) => {
                        if (!user) {
                            this.viewVars.flashMessages.push({
                                type: 'danger',
                                message: 'Token reset mot de passe invalide !'
                            });
                            return this.res.redirect('/users/forgot');
                        }

                        user.setPassword(this.req.body.password, (setPasswordErr, user) => {
                            if (setPasswordErr) {
                                throw setPasswordErr;
                            }

                            // user.resetPasswordToken = null;
                            // user.resetPasswordExpires = null;

                            user.save((err) => {
                                this.req.logIn(user, function(err) {
                                    done(err, user);
                                });
                            });
                        });


                    });

            },
            (user, done) => {
                let data = {};
                data.title = 'Mot de passe changé';
                data.from = this.req.app.locals.adminEmail;
                data.target = user.email;

                this.sendMailView('email/confirmReset', data, (err, response) => {

                    if(err){
                        throw err;
                    }

                    this.viewVars.flashMessages.push({
                        type: 'success',
                        message: 'Mot de passe changé, vous êtes connecté!'
                    });

                    return this.res.redirect('/');
                });
            }
        ], (err) => {
            console.log(err);
            return this.res.redirect('/users/login');
        });
    }
}


module.exports = UsersController;
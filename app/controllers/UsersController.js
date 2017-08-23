'use strict';

const baseController = require('./baseController');

class UsersController extends baseController{

    constructor(req, res, next){
        super(req, res, next);
        this.viewDir = 'users';
    }

    profileAction(){
        return this.render();
    }

    editAction(){
        return this.render();
    }

    registerAction(){
        if(this.req.method ==='POST'){
            let data = this.req.body;
            if(data){

                let user = {
                    username : data.username,
                    description: data.description,
                    firstName: data.firstname,
                    lastName: data.lastname,
                    role:  'user',
                    avatar: data.avatar,
                    email : data.email,
                    password : data.password,
                    gender : data.gender ? data.gender[0] : null,
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

        let avatar = data.avatar;
        delete data.avatar;

        async.waterfall([
            (done) => {
                userModel.register(new userModel(data), data.password, (err, user) => {
                    done(err, user);
                });
            },
            (user, done) => {
                // Upload avatar
                if(avatar) {

                    // Get extention from uri
                    let extension = avatar.match(/image\/(.*);/);
                    // Remove mimetype from uri base64
                    avatar = avatar.replace(/^data:image\/png;base64,/, "");

                    // build dirname and writefile
                    let dir = process.cwd() + '/app/public/uploads/' + user.username;
                    mkdirp(dir, (err) => {
                        if(err){
                            return done(err);
                        }

                        let path = dir + '/avatar.' + extension[1];
                        if(extension){
                            this.fs.writeFile(path, avatar,  'base64',
                                function (err) {



                                    done(err, user, path);
                                })
                        }

                    });
                }else{
                    done(null, null, null);
                }
            },
            (user, path, done) => {
                if(path){
                    user.update({_id: user._id}, { $set: { avatar: path } }, function(err, count){
                        done(err);
                    });
                }else{
                    done();
                }
            }
            ,
            (done) => {
                this.passport.authenticate('local')(this.req, this.res, () => {
                    this.viewVars.flashMessages.push({
                        type: 'success',
                        message: 'Merci pour votre inscription, vous êtes connecté !'
                    });
                    this.res.redirect('/');
                });
            },
        ], (err) => {
            console.log(err);

            if(err.name === 'UserExistsError'){
                this.viewVars.flashMessages.push({
                    type: 'danger',
                    message: 'L\'utilisateur : "' + data.username + '" existe déjà!'
                });
            }

            if(err.name === 'MongoError' && err.code === 11000){
                this.viewVars.flashMessages.push({
                    type: 'danger',
                    message: 'L\'email : "' + data.email + '" est déjà utilisé!'
                });
            }

            else{
                this.viewVars.flashMessages.push({
                    type: 'danger',
                    message: 'Une erreur est survenue, veuillez ressayer !'
                });
            }

            return this.res.redirect('back');
        });

        // userModel.register(new userModel(data), data.password, (err, user) => {
        //     if (err) {
        //         throw err;
        //     }
        //
        //     // Upload avatar
        //     if(data.avatar) {
        //         let extension = data.avatar.match(/image\/(.*);/);
        //         if(extension){
        //             this.fs.writeFile('/uploads/' + user.username + '/avatar', data.avatar + '.' + extension[1],
        //                 function (err) {
        //                 if (err) {
        //                     console.log(err);
        //                     return next(err);
        //                 }
        //             })
        //         }
        //     }
        //
        //     this.passport.authenticate('local')(this.req, this.res, () => {
        //         this.viewVars.flashMessages.push({
        //             type: 'success',
        //             message: 'Merci pour votre inscription, vous êtes connecté !'
        //         });
        //         this.res.redirect('/');
        //     });
        // });
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

                            user.resetPasswordToken = null;
                            user.resetPasswordExpires = null;

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
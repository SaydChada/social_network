'use strict';

const baseController = require('./baseController');

class UsersController extends baseController{

    constructor(req, res, next){
        super(req, res, next);
        this.viewDir = 'user';
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
            let userModel = this.getModel('users');

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

        if(this.req.method ==='POST'){
            this.passport.authenticate('local', this.login.bind(this))(this.req, this.res, this.next);
        }else{
            return this.render(this.view, this.viewVars);
        }

    }

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
                console.log('Account : ',account);
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


}


module.exports = UsersController;
'use strict';

const baseController = require('./baseController');

class UsersController extends baseController{

    constructor(req, res, next){
        super(req, res, next);
        this.viewDir = 'users';

        // Declare auth required views
        this.authViews.user = ['profile', 'edit', 'profile', 'search'];

    }

    profileAction(){

        this.viewVars.pageTitle = 'Mon profil';

        this.model.getByUserName(this.req.user.username, (err, user) =>{
            if(err){
                throw err;
            }

            this.viewVars.userData = user;
            return this.render('view');
        });
    }

    /**
     * Return json response based on query search
     * @param query
     */
    searchAction(query){

        query = query || this.req.body.query;
        query = new RegExp('^' + query, 'gi');

        let fields = {username : 1, lastName: 1, firstName: 1, _id: 1, avatar: 1, name: 1};
        this.model.find({$or:[{username: query},{lastName: query},{firstName: query}]}, (err, data) =>{

            if(err){
                throw err;
            }

            data = data || [];

            return this.render(null, data, 'json');
        }, fields, {limit: 5});


    }


    viewAction(username){

        this.viewVars.pageTitle = 'Profil de ' + username;

        // Find user by username
        this.model.getByUserName(username, (err, user) => {
            if(err){
                throw err;
            }

            if(user){

                // Check if user is in friend
                this.viewVars.statusClass = 'btn-success';
                this.viewVars.statusText  = 'Ajouter en ami';
                this.viewVars.statusRequest = false;

                this.req.user.friends.forEach((friend) =>{
                    if(friend.userId === user._id.toString() && friend.status === 'invitation en cours'){
                        this.viewVars.statusClass = 'btn-info';
                        this.viewVars.statusText  = 'Demande en attente';
                        this.viewVars.statusRequest = true;
                    }
                });


                // Find user's posts
                this.getModel('comments').findComments(user._id, (err, comments) => {
                    if(err){
                        throw err;
                    }
                    this.viewVars.userData = user;
                    this.viewVars.comments = comments;

                    // Inject current user in comments because

                    return this.render(this.view);
                });

            }else{
                //Profile not found end to 404
                this.res.statusCode = 404;
                this.next(new Error('Page not found'));
            }

        });
    }

    editAction(){

        this.viewVars.formTitle = 'Edtier mon profil';
        this.viewVars.pageTitle = 'Editer mon profil';
        let data = {};

        async.waterfall([

            (done) => {

                let userId = this.req.user ? this.req.user._id : null;
                this.model.findOne({ _id:  userId}, (err, user) =>{
                    this.viewVars.user = user;
                    done(err, user);
                })
            },
            (user, done) =>{

                if(this.req.method === 'POST') {

                    data = this.req.body;
                    let avatar = data.avatar;
                    delete data.avatar;

                    user.username = user.username != data.username ? data.username : user.username;
                    user.firstName = user.firstName != data.firstname ? data.firstname : user.firstName;
                    user.lastName = user.lastName != data.lastname ? data.lastname : user.lastName;
                    user.gender = user.gender != data.gender[0] ? data.gender[0] : user.gender;
                    user.gender = user.gender != data.gender[0] ? data.gender[0] : user.gender;
                    user.description = user.description != data.description ? data.description : user.description;
                    user.description = user.description != data.description ? data.description : user.description;
                    user.birthdate = user.birthdate != data.birthdate
                        ? moment(data.birthdate, 'DD/MM/YYYY').toDate()
                        : user.birthdate;

                    if(avatar && user.avatar != avatar) {

                        // Get extention from uri
                        let extension = avatar.match(/image\/(.*);/);

                        if(!extension){
                            done(null, user);
                        }else{
                            // Remove mimetype from uri base64
                            avatar = avatar.replace(/^data:image\/(?:png|jpg|jpeg|gif);base64,/, "");

                            let relativPath = '/uploads/'  + slugify(user.username) + '/avatar.' + extension[1];
                            // build dirname and writefile
                            let dir = process.cwd() + '/app/public/uploads/' + slugify(user.username);
                            mkdirp(dir, (err) => {
                                if(err){
                                    return done(err);
                                }

                                let fileName = 'avatar.' + extension[1];
                                let path = dir + '/' + fileName;
                                if(extension){
                                    this.fs.writeFile(path, avatar,  'base64',
                                        function (err) {
                                            user.avatar = relativPath;
                                            done(err, user);
                                        })
                                }

                            });

                        }

                    }else{
                        done(null, user);
                    }

                }
                else{
                    return this.render();
                }
            },
            (user, done) =>{
                if(user){
                    this.model.update({ username: user.username}, user, (err, count) =>{
                        if(err){
                            done(err);
                        }else{

                            if(data.oldpassword && data.password){
                                done(null, user);
                            }else{
                                this.viewVars.user = user;
                                this.viewVars.flashMessages.push(
                                    {type: 'success',
                                        message: 'Profil mis à jour'
                                    }
                                );
                                return this.res.redirect('view/' + user.username);
                            }
                        }
                    });
                }else{
                    done();
                }
            },
            (user, done) => {
                // Update password if attempt
                user.changePassword(data.oldpassword, data.password, (err, result) =>{
                    if(err){
                        done(err);
                    }else{
                        this.viewVars.flashMessages.push(
                            {type: 'success',
                                message: 'Profil et mot de passe mis à jours'
                            }
                        );
                        return this.res.redirect('view/' + user.username);
                    }
                });
            }

        ], (err) => {

            console.log(err);
            this.viewVars.flashMessages.push({type: 'danger', message: 'Une erreur est survenue, veuillez ressayer'});
            return this.res.redirect('/users/edit');
        });

    }

    registerAction(){
        if(this.req.method ==='POST'){
            let data = this.req.body;
            if(data){

                let user = {
                    username : data.username,
                    firstName: data.firstname,
                    lastName: data.lastname,
                    role:  'user',
                    email : data.email,
                    password : data.password,
                    gender : data.gender ? data.gender[0] : null,
                    birthdate: moment(data.birthdate, 'DD/MM/YYYY').toDate()
                };

                this.register(user);
            }
            // No username or login
            else{
                this.viewVars.flashMessages.push({
                    type: 'danger',
                    message: 'Formulaire invalide !'
                });
                this.render(this.view , this.viewVars);
            }
        }
        // Not post resend view
        else{
            this.viewVars.formTitle = 'Inscription';
            this.viewVars.pageTitle = 'Inscription';
            return this.render(this.view , this.viewVars);

        }

    }

    /**
     * Handle login
     */
    loginAction(){

        if(this.userAlreadyLoggedIn()){
            return;
        }

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

        if(this.userAlreadyLoggedIn()){
            return;
        }

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

        this.req.session.destroy( (err) => {
            this.res.redirect('/');
        });

    }

    resetAction(){

        if(this.userAlreadyLoggedIn()){
            return;
        }

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

        async.waterfall([
            (done) => {
                userModel.register(new userModel(data), data.password, (err, user) => {
                    done(err, user);
                });
            },
            (done) => {
                this.passport.authenticate('local')(this.req, this.res, () => {

                    let mailVars = {
                        username: data.username,
                        subject: this.req.app.locals.website + ':: Bienvenue',
                        title : 'Inscription sur ' + this.req.app.locals.website,
                        from: this.req.app.locals.adminEmail,
                        target: data.email
                    };

                    this.sendMailView('email/register', mailVars, (err, response) => {
                        this.viewVars.flashMessages.push({
                            type: 'success',
                            message: 'Merci pour votre inscription, vous êtes connecté !'
                        });
                        this.res.redirect('/');
                    });


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
                data.subjet = this.req.app.locals.website + ':: Mot de passe oublié';
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
                data.subject = this.req.app.locals.website + ':: Mot de passe changé';
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


    /**
     * Check if user is already logged in
     */
    userAlreadyLoggedIn(){

        // User already logged in
        if(this.req.user && this.req.user._id){
            this.viewVars.flashMessages.push({
                type: 'info',
                message: 'Vous êtes déjà connecté !'
            });

            this.res.redirect('/');
            return true;
        }else{
            return false;
        }

    }
}


module.exports = UsersController;
'use strict';

/**
 * base class for controllers
 */
const path = require('path');
class baseController{

    /**
     *
     * @param req  : Object | HttpRequest
     * @param res  : Object | HttpResponse
     * @param next : Function | next middleware
     */
    constructor(req, res, next){

        this.debug = false;

        this.req = req;
        this.next = next;
        this.res = res;
        this.fs = require('fs');
        this.params = this.req.params;
        this.passport = require('passport');
        this.models = {};
        this.viewDir = '';

        // autoload currentModel
        this.model = this.getModel(this.params.model);

        this.viewVars = {url : req.url, user: req.user, helpers: {}};
        this.viewVars.flashMessages =  this.req.session.flashMessages || [];
        this.helpersDir = '../views/helpers/';
    }


    /**
     * send Mail using template
     *
     * @param view : String | email view
     * @param data : Object | may contain context vars and layout
     * @param callback
     */
    sendMailView(view, data, callback){

        // Set default layout if not
        data.layout = data.layout || 'emailLayout';

        // render template before send email
        this.req.app.render(view, data, function(err, hbsTemplate){

            let mailOptions = {
                from: data.from,
                to: data.target,
                subject: data.subject,
                text: data.message,
                html: hbsTemplate
            };

            // send mail with defined transport object
            mailTransporter.sendMail(mailOptions, callback);
        });


    }

    /**
     * Do things before render
     * @param view
     * @param data
     * @returns {string|*}
     */
    beforeRender(view, data){

        if(view){
            this.params.action = view;
        }

        if(data){
            this.viewVars = Object.assign(this.viewVars, data);
        }

        // LOG
        if(this.debug){
            console.log('[method] : ', this.req.method);
            console.log('[viewDir] : "' , this.viewDir,'", [action] "', this.params.action, '"');
            console.log('==================== [viewVars] ====================== ' );
            console.dir( this.viewVars, {showHidden : false, depth : 1, color : true});
        }

        this.view = path.join(this.viewDir , this.params.action);

        return this.view;
    }

    /**
     * get model based on model name in lowercase
     * @param modelName
     * @returns {*}
     */
    getModel(modelName){

        modelName = baseController.toModelName(modelName);
        let modelPath = path.join('..','models', modelName);
        if(!this.models[modelName]){
            try{
                let model = require(modelPath);
                model.controller = this;
                this.models[modelName] = model;
            }catch(e){
                return null;
            }
        }

        return this.models[modelName];
    }

    /**
     * Capitalize modelname
     * @param model
     * @returns {string}
     */
    static toModelName(model){
        return model.charAt(0).toUpperCase() + model.slice(1);
    }

    /**
     * Call self::beforeRender then render view
     * @param view : string | template of the view to render
     * @param data
     * @param render
     */
    render(view, data, render){

        this.beforeRender(view, data, render);

        switch(render){
            case 'json' :
                this.res.json(data);
                break;
            default :
                this.res.render(this.view , this.viewVars);
                this.next();
                break;
        }
    }

    /**
     * Check if action exist
     * @param name
     * @returns {boolean}
     */
    actionExists(name){
        return name in this && typeof this[name] === 'function';
    }

    /**
     * Check if action exist and call it
     * @param name
     * @returns {boolean}
     */
    callAction(name){
        name = name + 'Action';
        if(this.actionExists(name)){
            this[name]();
            return true;
        }else{
            return false;
        }
    }
}

module.exports = baseController;
'use strict';
const baseController = require('./baseController');

class iMailsController extends baseController{
    constructor(req, res, next, app){
        super(req, res, next, app);
        this.viewDir = 'iMails';

        this.authViews.user = ['index'];
    }

    indexAction(){

        //TODO HELP
        // nsp.emit()                     => to all
        // client.broadcast.emit()        => to all except me
        //client.emit()                   => to me only
        //socket.broadcast.to(<socketId>) => to a specific socket id

        //client.once()                   => when client send event
        //nsp.once/ on                    => websocket events


        let io = this.app.socketIo;
        var nsp = io.of('/iMail');
        nsp.once('connection', (client) =>{

            nsp.emit('userJoin', this.req.user);

            /**
             * When user leave notify all other that he left
             */



            client.on('addMessage', (data) => {

                let user = this.req.user;

                let dataTemplate = {
                    username    : user.username,
                    avatar      : user.avatar,
                    layout      : false,
                    message     : data,
                    role        : user.role,
                    time        : moment().format('HH:mm')
                };

                // Get template to send to all other clients
                this.app.render('chat/partials/_chat_msg_block', dataTemplate,  (err, hbsTemplate) => {

                    if(err){
                        throw err;
                    }

                    nsp.emit('newMessage', hbsTemplate);
                });

            })
        });


        this.viewVars.pageTitle = 'chat';
        this.render(this.view);
    }

}

module.exports = iMailsController;




'use strict';
const baseController = require('./baseController');

class ChatController extends baseController{
    constructor(req, res, next, app){
        super(req, res, next, app);
        this.viewDir = 'chat';

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
        var nsp = io.of('/chat');
        nsp.once('connection', (client) =>{

            nsp.emit('userJoin', this.req.user);

            /**
             * When user leave notify all other that he left
             */
            client.on('disconnect', (data) => {
                client.broadcast.emit('userLeave', this.req.user);
            });


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

module.exports = ChatController;




"use strict";

const ws            = require('socket.io');
const UserModel     = require('../models/Users').getMongooseModel();

let count_logged= 0;
let count_anonymous = 0;



function counterLive(app, io, client){

    let dataTemplate = {
        total_logged : count_logged,
        total_anonymous : count_anonymous,
        total_users : count_logged + count_anonymous,
        layout: false,
        helpers : {/*getStatusLabel : require('../views/helpers/game/getStatusLabel')*/}
    };

    // Get template to send to all other clients
    app.render('partials/front/_counter_user', dataTemplate,  function(err, hbsTemplate){
        if(err){
            throw err;
        }
        io.emit('updateCounter', { template : hbsTemplate });
    });

}

module.exports = function(server, app){

    console.log('--- SOCKET ENABLED ---');
    let socketIo = ws.listen(server);

    socketIo.set('heartbeat timeout', 2000);
    socketIo.sockets.setMaxListeners(0);


    // client aka socket : because more readable
    socketIo.on('connection', function (client) {


        // ONly available for logged in users
        if(!client.handshake.session.passport){
            count_anonymous += 1;
        }else{
            // Save socketId in database
            let user = client.handshake.session.passport.user;
            count_logged += 1;
            //TODO comme on refresh le socket change à chaques fois inutile de le save
            UserModel.update({ _id : user._id}, {$set : {socketId : client.id}},function(err){
            });
        }

        counterLive(app, socketIo, client);

        /**
         * When user leave
         */
        client.on('disconnect', function(data){

            if(client.handshake.session.passport){

                count_logged -= 1;

                let user = client.handshake.session.passport.user;
                UserModel.update({_id : user._id}, {$set : {socketId : ''}}, function(err, count){
                    if(err){
                        throw err;
                    }
                });
            }else{
                count_anonymous -= 1;
            }

            counterLive(app, socketIo, client);


        });

    });

    return socketIo;
};
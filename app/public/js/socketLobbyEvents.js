function socketLobbyEvents(socket){

    // Dom elements
    var $userList = $('#users_list');
    var $maskCommands = $('#mask_commands');


    /**
     * Basicaly when user load the page where this script run
     */
    socket.on('connect', function() {
        // Prevent other user than another joined the lobby
        socket.emit('userJoin', {socketId : socket.id}, function(data){
                var userId = data.userId;
                var blockUser = data.template;

                var existingBlockUser = $('#' + userId);
                if(existingBlockUser.length){
                    existingBlockUser.replaceWith($(blockUser).addClass('bg-primary'));
            }
        });

    });

    /**
     * Prevent other user that a user leave
     */
    socket.on('userLeave', function(data){
        var $userBlock = $("#" + data.userId);
        // TODO remove only for users in a room where a user leave
        // $('#game_start_block').hasClass('invisible') || $('#game_start_block').addClass('invisible');
        $userBlock && $userBlock.remove();
    });


    /**
     * When user join update dom
     */
    socket.on('userJoin', function(data){
        var userId = data.userId;
        var blockUser = data.template;

        // Check if block already exist then ifnot append it to parent
        var existingBlockUser = $('#' + userId).length;
        if(!existingBlockUser){
            $userList.append($(blockUser));
        }
    });

    /* ==========================================================================
     DOM EVENTS
     ========================================================================== */

    // remove mask on cancel btn click
    $('.close-mask').on('click', function(e){
        e.preventDefault();
       $('.mask').each(function(key, el){
           $(el).hasClass('hidden') || $(el).addClass('hidden');
       })
    });

    // On click user display user's display mask with button handle event
    $userList.on('click','li:not(.bg-primary)',{}, function(){
        var $el = $(this);
        var id = $el.attr('id');
        var socketId = $el.data('socket-id');
        var username = $('.username', $el).html();

        var $chalengeUser = $('#chalenge_user');
        var $viewStats    = $('#view_stats');

        // TODO fix event declaration outside $userList to prevent same event added multiple times
        // Clean events binded to buttons
        $chalengeUser.unbind('click');
        $viewStats.unbind('click');


        /**
         * To challenge another user event handler
         */
        $chalengeUser.one('click', function(e){
            e.preventDefault();
            socket.emit('userRequestGame', {targetUsername : username, targetUser : id, targetSocketId : socketId});
            $maskCommands.addClass('hidden');
        });

        /**
         * Display stats to user after click in the wright button
         */
        $viewStats.one('click', function(e){
            e.preventDefault();
            socket.emit('getUsersInfo', {targetUser: id}, function(response){
                $(response.template).modal('show');
            });
            $maskCommands.addClass('hidden');
        });

        // Always remove mask
        $maskCommands.removeClass('hidden');

    });

}
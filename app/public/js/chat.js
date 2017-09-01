$(document).ready(function(e){

    /**
     * SOCKET events namespace /chat
     */

    var socket = io('/chat');

    /**
     * Message when user join
     */
    socket.on('userJoin', function(data){
        var $infoUserJoin = $('<li class="text-success"><strong>' + data.username + '</strong> rejoint le chat 😸</li>');
        $('.chat_area>ul').append($infoUserJoin);
    });

    /**
     * Message when user leave
     */
    socket.on('userLeave', function(data){
        var $infoUserLeave = $('<li class="text-info"><strong>' + data.username + '</strong> quite le chat 😽</li>');
        $('.chat_area>ul').append($infoUserLeave);
    });


    /**
     * Append message to users
     */
    socket.on('newMessage', function(data){
        $('.chat_area>ul').append($(data));

        //Force scroll to be always in bottom of box
        let chatDiv = document.querySelector('.chat_area');
        chatDiv.scrollTop = chatDiv.scrollHeight;
    });


    /**
     * Dom events
     */

    // Handle submit message
    $('#submit_chat').on('click', function(e){
        e.preventDefault();

        var $messageChat = $('#message_chat');

        var textInput = $.trim($messageChat.val());

        if(textInput !== ''){

            socket.emit('addMessage', textInput);

            $messageChat.val('');
        }

        return false;

    });

    // Triger enter in textarea
    $("#message_chat").keypress(function (e) {
        var code = (e.keyCode ? e.keyCode : e.which);
        if (code == 13) {
            $("#submit_chat").trigger('click');
            return true;
        }
    });

});
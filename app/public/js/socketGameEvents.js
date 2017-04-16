
function socketGameEvents(socket){

    var $maskCommands       = $('#mask_commands');
    var $maskChallenge      = $('#mask_challenge');
    var $maskResponse       = $('#mask_response');
    var $gameUserChoices    = $('#game_user_choice');
    var $gameCombinaisons   = $('#game_combinaison');

    //Activate demo at start
    var demo = new Demo($gameCombinaisons, $gameUserChoices);
    demo.renderDemo();


    // handle user's colors selection
    var clickedColors = [];
    // handle user's removed colors indexes
    var lastRemovedIndexes = [];

    /**
     * When user rage quit
     */
    socket.on('userLeaveRoom', function(data){
        demo.active = true;
        demo.renderDemo();
        $maskResponse.removeClass('hidden');
        $('#response_name', $maskResponse).html(data.username);
        $('#response_message', $maskResponse).html('a quitté la partie');
        $('#block_vs').length && $('#block_vs').remove();
    });

    /* ==========================================================================
     Challenge events
     ========================================================================== */

    /**
     * You can't challenge user that is already in a game
     */
    socket.on('userAlreadyInGame', function(data){
        // alert('"' + data.fromUsername + '" est en pleine partie !!');
        demo.active = true;
        demo.renderDemo();
        $maskResponse.removeClass('hidden');
        $('#response_name', $maskResponse).html(data.targetUsername);
        $('#response_message', $maskResponse).html('est actuellement en partie');
    });

    /**
     * When user reuest game
     * Attach events to reject and accept btn to targeted user
     */
    socket.on('requestGame', function(data){
        $('#challenger_name').html(data.fromUsername);

        var $acceptBtn = $('#accept_challenge');
        var $rejectBtn = $('#deny_challenge');


        $rejectBtn.unbind('click');
        $acceptBtn.unbind('click');

        $rejectBtn.one('click', function(e){
            e.preventDefault();
            $('#challenger_name').html('');
            socket.emit('rejectGame', data);
            $maskChallenge.addClass('hidden');
        });

        $acceptBtn.one('click', function(e){
            e.preventDefault();
            $('#challenger_name').html('');
            demo.active = false;
            socket.emit('acceptGame', data);
            $maskChallenge.addClass('hidden');

        });

        // Hide all other masks
        $maskCommands.addClass('hidden');
        $maskResponse.addClass('hidden');
        $maskChallenge.removeClass('hidden');

    });

    /**
     * When user reject another user request challenge
     */
    socket.on('challengeWasRejected', function(data){
        demo.active = true;
        demo.renderDemo();
        $maskResponse.removeClass('hidden');
        $('#response_name', $maskResponse).html(data.fromUsername);
        $('#response_message', $maskResponse).html('a rejeté votre défi');
    });

    /**
     * On acceptation emit game will begin to prevent other user
     */
    socket.on('challengeWasAccepted', function(data){

        demo.active = false;
        $gameCombinaisons.empty();
        $('#block_vs').length && $('#block_vs').remove();
        $('#game_start_block').prepend($(data.template));
        socket.emit('gameWillBegin', {});
    });

    // Display timer to user before game start
    socket.on('gameTimer', function(data){

        if(data.countdown === 0){
            $('#countdown_block').remove();
            socket.emit('gameStart', true);
        }else{
            $('#countdown').html(data.countdown);
        }
    });

    /**
     * Game start here
     */
    socket.on('gameBegin', function(data){
        // Reset user colors choice
        $gameUserChoices.children('.btn').html('?');
        $gameUserChoices.attr( "class", '' );
        clickedColors = [];
        lastRemovedIndexes = [];
        $('#result_game').html('&nbsp;');
        $gameCombinaisons.empty();
        $('#game_combinaison').append($(data.template));
        setTimeout(function(){
            $('#game_combinaison').children('.btn').attr('class', 'btn btn-default');
        }, 2000);
    });

    /**
     * Game end here
     */
    socket.on('gameFinished', function(data){
        $('#game_combinaison').empty();
        $('#block_vs').remove();

        if(socket.id === data.winner){
            $('#result_game').html('Gagné').attr('class','text-center');
            console.log('vous avez gagné');
        }
        else{
            $('#result_game').html('Perdu').attr('class','text-center');
            $gameUserChoices.attr( "class", '' );
            $gameUserChoices.hasClass('bg-danger') || $gameUserChoices.addClass('bg-danger');
            console.log('vous avez perdu');
        }
        // Reactivate demo
        demo.active = true;
        demo.renderDemo();
        socket.emit('afterGameFinished');
    });


    /* ==========================================================================
     DOM EVENTS
     ========================================================================== */

    // TODO refactor event redundancy
    $('.btn', '#game_user_choice').on('click', function(){

        // console.log('clickedColors', clickedColors);

        var color = $(this).data('color');

        // Get indexOf color (-1 if not found)
        var checkColorInArray = clickedColors.indexOf(color);

        // Color not in array we add it
        if(checkColorInArray === -1){

            // Check if user removed color previously and if so color to add get position of last removed
            if(lastRemovedIndexes[0]){
                clickedColors[lastRemovedIndexes[0] -1] = color;
                $(this).html(lastRemovedIndexes[0]);
                lastRemovedIndexes.shift();

            }else{
                clickedColors.push(color);
                $(this).html(clickedColors.length);
            }

            lastRemovedIndex = null;

            // If all colors was selected socket to server to check if order colors is good
            if(clickedColors.length === 5){

                // Check if demo active then validate colors and reset game on colors equals
                if(demo.active){
                 if(demo.checkColors(clickedColors) === true){
                     $gameUserChoices.attr( "class", '' );
                     $gameUserChoices.addClass('bg-success');
                     $gameUserChoices.children('.btn').html('?');
                     clickedColors = [];
                     demo.renderDemo();
                 }else{
                     $gameUserChoices.attr( "class", '' );
                     $gameUserChoices.hasClass('bg-danger') || $gameUserChoices.addClass('bg-danger');
                 }
                 return;
                }

                socket.emit('checkUserColors',
                    {userColors : clickedColors},
                    function(response){
                    // Case colors good so display event endGame
                    if(response){
                        $gameUserChoices.attr( "class", '' );
                        $gameUserChoices.addClass('bg-success');
                        socket.emit('endGame', {});
                    }else{
                        // Case when not good
                        $gameUserChoices.attr( "class", '' );
                        $gameUserChoices.hasClass('bg-danger') || $gameUserChoices.addClass('bg-danger');
                    }
                });
            }else{
                $gameUserChoices.attr( "class", '' );
                $gameUserChoices.hasClass('bg-default') && $gameUserChoices.removeClass('bg-default');
            }

            // console.log('clickedColors::push', clickedColors);
        }else{
            // Case when user want to remove a color
            lastRemovedIndexes.push($(this).html());
            $(this).html('?');
            clickedColors[checkColorInArray] = null;

            // Sort array to always have the wright order for user
            lastRemovedIndexes.sort();
            // console.log('clickedColors::splice', clickedColors);
        }

    })

}
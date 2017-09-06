$(document).ready(function(){

    $('#add_friend').on('click', function(e){
        e.preventDefault();

        var addFriendBtn = this;
        $.ajax({
            type: "POST",
            url: '/friends/add',
            data: {target : $(this).data('user-id')},
            success: function(data, text){

                // display flash message
                var $flash = $(data.templateFlash);
                $('#nav').after($flash);

                // change button to // En attente
                $(addFriendBtn).addClass('btn-info');
                $(addFriendBtn).html('Demande en attente');
                $(addFriendBtn).attr('disabled', true);
            },
            error: function (request, status, error) {

                var data = request.responseJSON;
                // display flash message
                var $flash = $(data.templateFlash);
                $('#nav').after($flash);
            }
        });
    });



    var userCurrentFriends = $('#my_friends').data('current-friends');
    var magicSearchUser = $('#my_friends').magicSuggest({
        maxDropHeight: 200,
        placeholder: 'Proposer un ami',
        data: '/friends/confirmedlist/',
        dataUrlParams : {currentFriends : userCurrentFriends},
        displayField: ['username'],
        valueField: 'userId',
        method: 'post',
        hideTrigger: true,
        maxSelection: 1,
        typeDelay: 200,
        autoSelect: false,
        noSuggestionText: 'Aucun ami à proposer! ',
        allowFreeEntries: false,
        maxSelectionRenderer: function(value){
            return null;
        }
    });


    $('#submit_recommended_friend').on('click', function(e){
        e.preventDefault();

        $(this).attr('disabled', true);

        var msValue = magicSearchUser.getValue();
        if(!msValue || !(msValue instanceof Array)){
            return false;
        }

        var currentUserId = $(this).data('current-user-id');
        var userId = msValue[0];
        $.ajax({
            type: "POST",
            url: '/friends/recommend',
            data: {targetUserId : userId, currentUserId : currentUserId},
            success: function(data, text){

                console.log(data);
                // display flash message
                var $flash = $(data.templateFlash);
                $('#nav').after($flash);

                // clean selection
                magicSearchUser.setSelection([]);

                // enable submit
                $(this).attr('disabled', false);
            },
            error: function (request, status, error) {

                console.log(request);

                var data = request.responseJSON;
                // display flash message
                var $flash = $(data.templateFlash);
                $('#nav').after($flash);
                $(this).attr('disabled', true);

            }
        });


    });

});
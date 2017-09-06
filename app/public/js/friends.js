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


    var magicSearchUser = $('#my_friends').magicSuggest({
        maxDropHeight: 200,
        placeholder: 'Proposer un ami',
        data: '/friends/confirmedlist/',
        displayField: ['username'],
        valueField: 'userId',
        method: 'get',
        hideTrigger: true,
        maxSelection: 1,
        useZebraStyle: true,
        typeDelay: 200,
        autoSelect: false,
        noSuggestionText: '',
        allowFreeEntries: false,
        maxSelectionRenderer: function(value){
            return null;
        }
    });


    $('#submit_recommended_friend').on('click', function(e){
        e.preventDefault();

        var msValue = magicSearchUser.getValue();
        if(!msValue){
            return false;
        }
        var userId = msValue[0];
        $.ajax({
            type: "POST",
            url: '/friends/recommend',
            data: {target : userId},
            success: function(data, text){

                // display flash message
                var $flash = $(data.templateFlash);
                $('#nav').after($flash);

                // clean selection
                magicSearchUser.setSelection([]);
            },
            error: function (request, status, error) {

                var data = request.responseJSON;
                // display flash message
                var $flash = $(data.templateFlash);
                $('#nav').after($flash);
            }
        });


    });

});
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

});
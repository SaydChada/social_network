$(document).ready(function(){


    /**
     * Handle accept/reject friend request btn click
     */
    $('.accept_reject_invitation').on('click', function(e){
        e.preventDefault();

        var that = $(this);
        var userId = $(this).data('user-id');

        bootbox.dialog({
            title: 'Accepter / Refuser',
            message: "Accepter la demande d'ami ?",
            buttons: {
                success: {
                    label:     'Accepter',
                    className: 'btn-success',

                    callback: function() {

                        //Todo move element to friends list (#list_friends}
                        $.ajax({
                            type: 'PUT',
                            url: '/friends/accept',
                            data: {userId : userId},
                            success: function(data) {

                                $(that).attr('disabled', true);
                                bootbox.dialog({
                                    message: 'Vous êtes maintenant ami avec ' + data.username,
                                    title: "Bravo",
                                    buttons: {
                                        success: {
                                            label: "Ok",
                                            className: "btn-success",
                                        },
                                    }
                                });
                            }
                        });


                    },
                },
                danger: {
                    label:     'Refuser',
                    className: 'btn-danger',

                    callback: function() {

                        //Todo remove element in dom by userId
                        $.ajax({
                            type: 'DELETE',
                            url: '/friends/delete',
                            data: {userId : userId},
                            success: function(data) {
                                $(that).closest('tr').fadeOut().remove();
                            }
                        });

                    },
                },
                main: {
                    label:     'Annuler',
                    className: 'btn-default'
                }
            },
        });

    });

    /**
     * Handle delete friend btn click
     */
    $('.delete_friend').on('click', function(e){
        e.preventDefault();

        var that = $(this);
        var userId = $(this).data('user-id');

            bootbox.alert({
                message:   'Confirmer suppression ami',
                className: 'bootbox-sm',

                callback: function() {
                    $.ajax({
                        type: 'DELETE',
                        url: '/friends/delete',
                        data: {userId : userId},
                        success: function(data) {
                            $(that).closest('tr').fadeOut().remove();
                        }
                    });
                },
            });
    });


    /**
     * Handle accept / reject recommendation
     */
    $('.accept_reject_recommendation').on('click', function(e){
        e.preventDefault();



        var that = $(this);
        var userId = $(this).data('user-id');

        bootbox.dialog({
            title: 'Accepter / Refuser',
            message: "Accepter la recommendation ?",
            buttons: {
                success: {
                    label:     'Accepter',
                    className: 'btn-success',

                    callback: function() {

                        $.ajax({
                            type: 'PUT',
                            url: '/friends/accept',
                            data: {userId : userId},
                            success: function(data) {

                                $(that).attr('disabled', true);
                                bootbox.dialog({
                                    message: 'Vous êtes maintenant ami avec %username%',
                                    title: "Bravo",
                                    buttons: {
                                        success: {
                                            label: "Ok",
                                            className: "btn-success",
                                        },
                                    }
                                });
                            }
                        });

                    },
                },
                danger: {
                    label:     'Refuser',
                    className: 'btn-danger',

                    callback: function() {

                        //Todo remove element in dom by userId
                        $.ajax({
                            type: 'DELETE',
                            url: '/friends/delete',
                            data: {userId : userId},
                            success: function(data) {
                                $(that).closest('tr').fadeOut().remove();
                            }
                        });


                    },
                },
                main: {
                    label:     'Annuler',
                    className: 'btn-default'
                }
            },
        });


    });


});
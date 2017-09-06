$(document).ready(function(){

    var socket = io('/');

    $('#publish_btn').on('click', function(e){
        e.preventDefault();
        var rawComment = $.trim(tinyMCE.get('comment').getContent({format: 'text'}));
        var comment = tinyMCE.get('comment').getContent();

        var targetId = $('#comment').data('target');

        if(rawComment === ''){
            $(this).attr('disabled', true);
            return false;
        }else{
            $.ajax({
                type: "POST",
                url: '/comments/add',
                data: {message : comment, target : targetId },
                success: function(data, text){

                    // display flash message
                    var $flash = $(data.templateFlash);
                    $('#nav').after($flash);
                    tinyMCE.get('comment').setContent('');

                    // append block comment to comments section
                    var $blockComment = $(data.templateComment);
                    $('#bloc_comments').prepend($blockComment);
                    socket.emit('addedComment');

                },
                error: function (request, status, error) {

                    var data = request.responseJSON;
                    // display flash message
                    var $flash = $(data.templateFlash);
                    $('#nav').after($flash);
                }
            });
        }
    });


    // Delegate click to remove_comment element added or existing
    // Handle delete of comment
    $('#bloc_comments').on('click','.remove_comment', function(e){

        if(window.confirm('Confirmer la suppression?')){

            let commentId = $(this).data('comment-id');

            $.ajax({
                type: "DELETE",
                url: '/comments/delete',
                data: {id: commentId},
                success: function(data, text){

                    // display flash message
                    var $flash = $(data.templateFlash);
                    $('#nav').after($flash);

                    //Remove delete comment in dom
                    var $blockComment = $('[data-comment-id="'+ commentId +'"]').closest('.row');
                    $blockComment.remove();
                    socket.emit('removedComment')

                },
                error: function (request, status, error) {

                    var data = request.responseJSON;
                    // display flash message
                    var $flash = $(data.templateFlash);
                    $('#nav').after($flash);
                }

            });

        }else{
            return false;
        }


    })
});
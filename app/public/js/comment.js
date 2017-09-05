$(document).ready(function(){

    $('#publish_btn').on('click', function(e){
        e.preventDefault();
        var rawComment = $.trim(tinyMCE.get('comment').getContent({format: 'text'}));
        var comment = tinyMCE.get('comment').getContent();

        var targetId = $('#comment').data('target');

        if(rawComment === ''){
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


    $('#remove_comment').on('click', function(e){
        e.preventDefault();

        if(window.confirm('Confirmer la suppression?')){


            let commentId = $(this).data('id');

            $.ajax({
                type: "DELETE",
                url: '/comments/delete',
                data: {id: commentId},
                success: function(data, text){

                    // display flash message
                    var $flash = $(data.templateFlash);
                    $('#nav').after($flash);

                    //Remove delete comment in dom
                    var $blockComment = $('[data-id="'+ commentId +'"]').closest('.row');
                    $blockComment.remove();

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
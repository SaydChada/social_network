(function($){

    // Always enable socket
    var socket = io();

    /**
     * Update live counter of user online
     */
    socket.on('updateCounter', function(data){
        $('#counter_live').html($(data.template));
    });


    /**
     * Overide fn.size for magicsuggest
     */
    $.fn.size = function(){ return this.length};



    // Tool class to disable form submit
    $('.form-disable').on('submit', function(e){
        e.preventDefault();
        return false;
    });

    $('.toggle-password').on('click', function(e){
        var $passwordInput = $(this).prev('input[name="password"]');
        var attr = $passwordInput.attr('type');

        var toggleAttr = attr === 'password' ? 'text' : 'password';
        $passwordInput.attr('type', toggleAttr);

    });

})(jQuery);
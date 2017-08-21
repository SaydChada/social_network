$(document).ready(function(){
    var $characterLeft = $('#characterLeft');
    $characterLeft.text('200 characters réstants');
    $('#message').keyup(function () {
        var max = 200;
        var len = $(this).val().length;
        if (len >= max) {
            $characterLeft.text('Limite de caractères atteinte');
            $characterLeft.addClass('text-danger');
            $('#btnSubmit').addClass('disabled');
        }
        else {
            var ch = max - len;
            $characterLeft.text(ch + ' caractères restants');
            $('#btnSubmit').removeClass('disabled');
            $characterLeft.removeClass('text-danger');
        }
    });
});

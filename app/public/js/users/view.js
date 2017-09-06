$(document).ready(function(e){

    var minChars, maxChars;

    tinymce.init({
        selector: '.tmce',
        invalid_elements : "script",
        menubar: false,
        branding: false,
        elementpath: false,
        toolbar: "undo  redo | styleselect | bold italic |  forecolor \
         backcolor | outdent indent  | bullist numlist | link image \
         ",
        file_picker_types: 'image media',
        plugins: "image textcolor lists",
        height: 200,
        width : 'auto',
        max_height: 200,
        setup: function(ed){

            ed.on('init', function(e){
                currentLength =  $(ed.getBody()).text().length;
                maxChars = parseInt($('#'+(ed.id)).attr("maxlength"));
                minChars = parseInt($('#'+(ed.id)).attr("minlength"));
            });

            ed.on('keyUp', function(e){


                let tinylen =  $(ed.getBody()).text().length;
                let $totalChars =  $('#totalChars');
                $totalChars.text('(' + tinylen + ' / ' + maxChars + ')');
                if(tinylen >= maxChars || tinylen <= minChars){
                    $totalChars.css('color','red');
                    $('#publish_btn').prop('disabled', true);
                }else{
                    $('#publish_btn').prop('disabled', false);
                    $totalChars.css('color', 'black');
                }
            });
        }
    }).then(function(ed){

        $('.mce-path').html(
            '<p"> Minimum ' + minChars + ' charactères, maximum ' + maxChars + '.' +
            '&nbsp;<span id="totalChars">(' + currentLength + '/' + maxChars +')</span></p> ');
    });


    var magicSearchUser = $('#my_friends').magicSuggest({
        maxDropHeight: 200,
        placeholder: 'Chercher un utilisateur',
        data: '/friends/confirmedlist/',
        displayField: ['username'],
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

    // MS EVENT

    $(magicSearchUser).on('keydown', function(event, that, key){
        console.log(key.keyCode);
        if( key.keyCode === 13){
            return false;
        }

    });

    $(magicSearchUser).on('selectionchange', function(event, that, selection){

        that.setSelection([]);
    });

});
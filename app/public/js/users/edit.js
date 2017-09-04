$(function () {

    let currentLength = 0;
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
        max_height: 200,
        setup: function(ed){

            ed.on('init', function(e){
                currentLength =  $(ed.getBody()).text().length;
                $('#register_btn').prop('disabled', false);
            });

            ed.on('keyUp', function(e){


                let tinylen =  $(ed.getBody()).text().length;
                let $totalChars =  $('#totalChars');
                let maxChars = parseInt($('#'+(ed.id)).attr("maxlength"));
                let minChars = parseInt($('#'+(ed.id)).attr("minlength"));
                $totalChars.text('(' + tinylen + ' / 100)');
                if(tinylen >= maxChars || tinylen <= minChars){
                    $totalChars.css('color','red');
                }else{
                    $totalChars.css('color', 'black');
                }
            });
        }
    }).then(function(ed){
        $('.mce-path').html(
            '<p"> Minimum 10 charactères, maximum 100.</p> ' +
            '</br>' +
            '<p id="totalChars">('+ currentLength +'/100)</p>');
    });

    $('#birthdate').datetimepicker({
        showClose: true,
        viewMode: 'years',
        maxDate : moment(),
        format: 'DD/MM/YYYY',
        defaultDate: $('#birthdate').val() ? moment($('#birthdate').val(), 'DD/MM/YYYY') : '',
        useCurrent: false,
        minDate : moment().subtract(100, 'year')
    });

    $('#gender').magicSuggest({
        data: ['male', 'female'],
        maxSelection: 1,
        maxSuggestions: 2,
        allowFreeEntries: false,
        value:  [$('#gender').data('value')],
        name: 'gender'
    });

    Tptr.sources.local.action.content = 'Chercher';

    $('.js-tapatar').tapatar({
        sources: {
            local: {
                enabled: true,
                order: 1,
                id: 'local',
                title: 'Depuis le disque',
                action: {
                    content: 'Chercher',
                }
            },
        },
        image_url_prefix: '/js/dist/tapatar/img/',
        templates: {
            widget: '<div class="tptr-widget"><span class="tptr-widget-pick">Avatar</span></div>',
            picker: '<div class="tptr-picker"><div class="tptr-close"></div><div class="tptr-image-holder tptr-box-part"><div class="tptr-big-image"> </div></div><div class="tptr-sources-holder tptr-box-part"><div class="tptr-sources"></div><button class="tptr-save">Valider</button></div></div>',
        },
        default_image: function() {

            if($('.js-tapatar').val()){
                return $('.js-tapatar').val();
            }

            return this.image_url_prefix + 'default.svg';
        },
    });

    $.fn.validator.Constructor.INPUT_SELECTOR = ':input:not([type="submit"], [type="reset"], button)';
    $('#edit_user_form').validator();

});
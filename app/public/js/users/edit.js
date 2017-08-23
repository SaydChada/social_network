let spinner = new Spinner().spin();
document.querySelector('.loading').appendChild(spinner.el);
$(function () {

    tinymce.init({
        selector: '.tmce',
        menubar: false,
        branding: false,
        elementpath: false,
        file_picker_types: 'image media',
        plugins: "image",
        height: 200,
        max_height: 200,
        setup: function(ed){

            ed.on('init', function(e){
                $('.loading').remove();
                $('#register_btn').removeClass('disabled');
            });

            ed.on('keyUp', function(e){
                let tinylen = ed.getContent().replace(/(<([^>]+)>)/ig,"").length;
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
    }).then(function(editor){
        $('#label_description').removeClass('hidden');
        $('.mce-path').html(
            '<p"> Minimum 10 charactères, maximum 100.</p> ' +
            '</br>' +
            '<p id="totalChars">(0/100)</p>');
    });

    $('#birthdate').datetimepicker({
        showClose: true,
        viewMode: 'years',
        maxDate : moment(),
        format: 'DD/MM/YYYY',
        defaultDate: '',
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
                // return $('.js-tapatar').val();
                return '/uploads/yassay_fr-5/avatar.png';
            }

            return this.image_url_prefix + 'default.svg';
        },
    });

});
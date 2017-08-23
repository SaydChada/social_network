let spinner = new Spinner().spin();
document.querySelector('.loading').appendChild(spinner.el);
$(function () {

    tinymce.init({
        selector: '.tmce',
        menubar: false,
        branding: false,
        elementpath: false,
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
        name: 'gender'
    });

    $('.js-tapatar').tapatar({
        sources: {
            local: {enabled: true, order: 1},
        },
        image_url_prefix: '/js/dist/tapatar/img/',
        default_image: function() {
            return this.image_url_prefix + 'default.svg';
        },
    });

});
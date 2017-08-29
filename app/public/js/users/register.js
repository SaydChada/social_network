$(function () {

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
        name: 'gender',
    });

    $.fn.validator.Constructor.INPUT_SELECTOR = ':input:not([type="submit"], [type="reset"], button)';
    $('#register_user_form').validator();
});
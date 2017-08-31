(function($){

    /**
     * Overide fn.size for magicsuggest
     */
    $.fn.size = function(){ return this.length};



    // Tool class to disable form submit
    $('.form-disable').on('submit', function(e){
        e.preventDefault();
        return false;
    })

})(jQuery);
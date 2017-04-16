function socketStatusEvents(socket){

    var $statusMenu = $('#status_menu');

    // Attach event to all li in status change menu
    $('li', $statusMenu).each(function(i, el){
        var $el = $(el);
        $el.on('click', function(e){
            e.preventDefault();
            var newStatus = $el.data('status');
            socket.emit('userStatusChange', {newStatus : newStatus});
        })
    });

    /**
     * When user changed his status, handle that event and update dom
     */
    socket.on('userStatusChanged', function(data){
        var userId   = data.userId;
        var status   = data.newStatus;
        var cssClass = data.cssClass;
        var $blockUser = $('#' + userId);

        var $spanLabel = $('.status_label', $blockUser);

        $spanLabel.removeClass('label-warning label-info label-success label-danger');
        $spanLabel.addClass(cssClass);
        $spanLabel.html(status);

    });
}
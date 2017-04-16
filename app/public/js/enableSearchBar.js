/**
 * User list.js lib to allow user filtering lobby by string
 */
function enableSearchBar(){

    var options = {
        valueNames: [ 'username' ]
    };
    new List('block_list', options);

}
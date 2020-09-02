$(document).ready(function(){

setTimeout(function() {
    $('#alertDiv').fadeOut('slow');
}, 9000);


 $('#filetype').on('change', function() {
    var val = $(this).val();
    if(val=="file"){
    $('#fileId').css('display', 'block');
    $('#urlId').css('display', 'none');
    }
    else{
    $('#fileId').css('display', 'none');
    $('#urlId').css('display', 'block');
    }
}).change();

});

$(document).ready(function(){

setTimeout(function() {
    $('#alertDiv').fadeOut('slow');
}, 5000);


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

function ValidURL() {
str="https://checklistform.blob.core.windows.net/forms/JhonSeldi_Workspace.pdf"
  var regex = /(http|https):\/\/(\w+:{0,1}\w*)?(\S+)(:[0-9]+)?(\/|\/([\w#!:.?+=&%!\-\/]))?/;
  if(!regex .test(str)) {
    alert("Please enter valid URL.");
  } else {
    alert("valid URL.");
  }
}

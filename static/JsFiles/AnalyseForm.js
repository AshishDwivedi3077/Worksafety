$(document).ready(function(){

setTimeout(function() {
    $('#alertDiv').fadeOut('slow');
}, 5000);

     $("#analysedBtn" ).click(function() {
         var CntStr=$("#SasId").val();
         var JsonContainer="analizedforms"
         var PdfContainer="forms"
         var Endpoint=$("#endpointId").val();
         var ApimKey=$("#ApimkeyId").val();
         var ModelID=$("#modelId").val();
         var Path_url=$("#fileId").val();

         var fileToRead = document.getElementById("SelectFileID")
         var files = fileToRead.files[0];
         alert(""+fileToRead.files)


         var filePath="";
         var UrlPath="";
         var filename;
         var regex = /(http|https):\/\/(\w+:{0,1}\w*)?(\S+)(:[0-9]+)?(\/|\/([\w#!:.?+=&%!\-\/]))?/;
//         if(!regex .test(Path_url))
//          {
//            filePath = Path_url;
//            filename=filePath.replace(/^.*[\\\/]/, '').slice(0,-4)
//          }
//          else
//           {
//           UrlPath=Path_url;
//           filename=UrlPath.split('/').pop().slice(0,-4);
//           }
        var postData={"ConnectionStr":CntStr,"JsonContainer":JsonContainer,"PdfContainer":PdfContainer,"Endpoint":Endpoint,
        "ApimKey":ApimKey,"ModelID":ModelID,"filePath":""+files,"UrlPath":UrlPath,"filename":filename}

          $.ajax({
            url: 'AnalyseFIle',
            type: "POST",
            data: postData,
            success: function(resp, textStatus, jqXHR) {

                alert(resp);
//                alert('Updated successfully');
                $("#fileId").val("")
            },
            error: function(jqXHR, textStatus, errorThrown) {
                alert('Error!');
                $("#fileId").val("")
            }
            });


         });
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

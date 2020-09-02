var count=0;


$(document).ready(function(){
    $('#formImg').hide();
    $("#GetBlobBtn" ).click(function() {
    count=0;
    $('#SearchForm').val("")
        var CntStr=$("#SasId").val();
        var ProjectName=$("#ProjectContId").val();
        var ContainerName=$("#ContNameId").val();
        var blob="";

        LoadGridFromBlob(CntStr,ProjectName,ContainerName,blob)
        $("#FormNoLbl").empty();
        $("#FormNoLbl").append(count+1 + " of " + bloblength );
    });

    $('#SearchForm').bind('change', function() {
        var blob = this.value;
        var CntStr=$("#SasId").val();
        var ProjectName=$("#ProjectContId").val();
        var ContainerName=$("#ContNameId").val();
        LoadGridFromBlob(CntStr,ProjectName,ContainerName,blob)
    });

    $( "#nextBtn" ).click(function() {

        var CntStr=$("#SasId").val();
        var ProjectName=$("#ProjectContId").val();
        var ContainerName=$("#ContNameId").val();        count++;
        if(count< bloblength)
        {
            var blob=bloblist[count];
            LoadGridFromBlob(CntStr,ProjectName,ContainerName,blob)
            $("#FormNoLbl").empty();
            $("#FormNoLbl").append(count+1 + " of " + bloblength );
        }
        else
        {
            alert("No more files")
        }
    });

    $( "#prevbtn" ).click(function() {
     var CntStr=$("#SasId").val();

        var ProjectName=$("#ProjectContId").val();
        var ContainerName=$("#ContNameId").val();
        count--;
        if(count >= 0 )
        {
            var blob=bloblist[count];

            LoadGridFromBlob(CntStr,ProjectName,ContainerName,blob)
            $("#FormNoLbl").empty();
            $("#FormNoLbl").append(count+1 + " of " + bloblength );
        }
        else
        {
            alert("No more files")
        }
  });

});

var JobDesign={};
var HMT={};
var Lighting={};
var Noise={};
function showGrid(Griddata)
{
        $('#jqGrid').jqGrid('clearGridData');
        $("#jqGrid").jqGrid('setGridParam', { data: Griddata});
        $("#jqGrid").trigger('reloadGrid');

    $("#jqGrid").jqGrid({
        datatype: "local",
        data: Griddata,
        pager: '#jqGridPager',
        colModel: [
                    { label: 'Label', name: 'Label', width: 480 ,editable: false,hidden:false},
                    { label: 'Key', name: 'Key', width: 80 ,editable: false,hidden:true},
                    { label: 'Values', name: 'Values', width: 200,align:'center',editable: true },
           {
               label: "Edit",

                name: "actions",

                width: 80,
              formatter: "actions",
                search: false,
                sortable: false,
                formatoptions: {
                   keys: true,
                    editbutton: true,
                   addOptions: {},
                   delbutton: false,
                    delOptions: {
                     beforeSubmit: function (postdata) { },
                        onclickSubmit: function (params, Shiftdata) {  },
                        afterComplete: function (response, Shiftdata) { }
                         },

                    afterSave: function (rowID, response) {
                     var item = $(this).jqGrid("getLocalRow", rowID);
                        UpdateJsonToBlob(item)
                   },
               },
         }
      ],
      autowidth:true,
       shrinkToFit:true,

        rowList: [15, 30, 45, 60],
         sortorder: "desc",
        gridview: true,
        autoencode: true,
         cellEdit: false,
        cellsubmit: 'clientArray',
        editurl: 'clientArray',
        viewrecords: true,
        rowNum: 15,
        emptyrecords: 'No records to display',
        jsonReader: {
            root: "rows",
           page: "page",
            total: "total",
           records: "records",
            repeatitems: true
 },
  }).jqGrid("navGrid", "#jqGridPager",
  {
    edit: false,
     add: false,
     del: false,
     search: true,
     refresh: true
      } );
}
var bloblist
var bloblength;
function LoadGridFromBlob(CntStr,ProjectName,ContainerName,blob)
{

        valu={"ConnectionStr":CntStr,"ProjectName":ProjectName,"ContainerName":ContainerName,"blob":blob}
        $.ajax({
        url: 'loadgridfromblob',
        type: "POST",
        data:valu,
        async:false,
        success: function(resp, textStatus, jqXHR) {
        //alert(JSON.stringify(resp))
            bloblist=resp.FileName;
            bloblength=resp.FileName.length
             $("#FormList").empty()

            $.each(resp.FileName, function(i, item) {
              $("#FormList").append($("<option>").attr('value', item));
            });

            $("#FileName").empty();
            $('#formImg').show();
            if(blob=="")
            {
               $("#FileName").append(JSON.stringify(resp.Content));
               if(resp.IsQA==true)
               $('#formImg').attr('src', "https://checklistform.blob.core.windows.net/"+ProjectName+"/"+ (resp.FileName[0]).slice(7, -5) + ".pdf");
                else
                $('#formImg').attr('src', "https://checklistform.blob.core.windows.net/"+ProjectName+"/"+ (resp.FileName[0]).slice(7, -5) + ".jpg");


            }
            else
            {
                 $("#FileName").append(blob);
                if(resp.IsQA==true)
               $('#formImg').attr('src', "https://checklistform.blob.core.windows.net/"+ProjectName+"/"+ (resp.FileName[0]).slice(7, -5) + ".pdf");
                else
                $('#formImg').attr('src', "https://checklistform.blob.core.windows.net/"+ProjectName+"/"+ (resp.FileName[0]).slice(7, -5) + ".jpg");

            }
            showGrid(resp.GridData)
            $("#prevbtn").prop('disabled', false);
            $("#nextBtn").prop('disabled', false);
            $("#SearchForm").val("");
        },
        error: function(jqXHR, textStatus, errorThrown) {
            alert('No more files!');
        }

        });
}

function UpdateJsonToBlob(data)
{

     data['count']=count;
     data['EditContainer']=$("#EditContId").val();
    $.ajax({
    url: 'updatejsontoblob',
    type: "POST",
    data: data,
    success: function(resp, textStatus, jqXHR) {
        alert('Updated successfully');
    },
    error: function(jqXHR, textStatus, errorThrown) {
        alert('Error occurred!');
    }
    });
}

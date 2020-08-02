var count=0;

$(document).ready(function(){
    $("#GetBlob" ).click(function() {
    count=0;
    $('#SearchForm').val("")
        var CntStr=$("#SasId").val();
        var Container=$( "#ContainerId option:selected" ).val();
        var blob="";

        LoadGridFromBlob(CntStr,Container,blob)
        $("#FormNoLbl").empty();
        $("#FormNoLbl").append(count+1 + " of " + bloblength );
    });

    $('#SearchForm').bind('change', function() {
        var blob = this.value;
        var CntStr=$("#SasId").val();
        var Container=$( "#ContainerId option:selected" ).val();
        LoadGridFromBlob(CntStr,Container,blob)
    });

    $( "#nextBtn" ).click(function() {

        var CntStr=$("#SasId").val();
        var Container=$( "#ContainerId option:selected" ).val();
        count++;
        if(count< bloblength)
        {
            var blob=bloblist[count];
            LoadGridFromBlob(CntStr,Container,blob)
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
        var Container=$( "#ContainerId option:selected" ).val();
        count--;
        if(count >= 0 )
        {
            var blob=bloblist[count];

            LoadGridFromBlob(CntStr,Container,blob)
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
                    { label: 'No', name: 'id', width: 10, key:true ,hidden:true},
                    { label: 'Labels', name: 'Labels', width: 10 ,editable: false,hidden:true},
                    { label: 'Question', name: 'question', width: 600 ,editable: false},
                    { label: 'Answer', name: 'answer', width: 130,align:'center',editable: true },
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

function UpdateJsonToBlob(data)
{

     data['count']=count;
    $.ajax({
    url: 'UpdateJsonToBlob',
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

var bloblist
var bloblength;
function LoadGridFromBlob(CntStr,Container,blob)
{
        valu={"ConnectionStr":CntStr,"Container":Container,"blob":blob}
            $.ajax({
        url: 'LoadGridFromBlob',
        type: "POST",
        data:valu,
        async:false,
        success: function(resp, textStatus, jqXHR) {
            bloblist=resp.FileName;
            bloblength=resp.FileName.length
             $("#FormList").empty()

            $.each(resp.FileName, function(i, item) {
              $("#FormList").append($("<option>").attr('value', item));
            });

            $("#FileName").empty();

            if(blob=="")
            {
               $("#FileName").append(JSON.stringify(resp.FileName[0]).slice(1,-1));
               $('#formImg').attr('src', "https://checklistform.blob.core.windows.net/checklistfiles/"+ (resp.FileName[0]).slice(7, -5) + ".pdf");
            }
            else
            {
                 $("#FileName").append(blob);
                 $('#formImg').attr('src', "https://checklistform.blob.core.windows.net/checklistfiles/"+ blob.slice(7, -5) + ".pdf");
            }
            showGrid(resp.GridData)
            $("#prevbtn").prop('disabled', false);
            $("#nextBtn").prop('disabled', false);
        },
        error: function(jqXHR, textStatus, errorThrown) {
            alert('No more files!');
        }

        });
}


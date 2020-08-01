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
function showGrid(dd)
{
            var mydata = [
               { id: "1", Labels:"Name", question: "Name",answer: JSON.stringify(dd.Name).slice(1, -1)},
               { id: "2",Labels:"Company", question: "Company",answer: JSON.stringify(dd.Company).slice(1, -1)},
               { id: "3",Labels:"Employee Code",  question: "Employee Code",answer: JSON.stringify(dd['Employee Code']).slice(1, -1)},
               { id: "4",Labels:"answer1", question: JSON.stringify(dd.question1).slice(1, -1),answer: JSON.stringify(dd.answer1).slice(1, -1) },
               { id: "5",Labels:"answer2",  question: JSON.stringify(dd.question2).slice(1, -1),answer: JSON.stringify(dd.answer2).slice(1, -1)},
               { id: "6",Labels:"answer3",  question: JSON.stringify(dd.question3).slice(1, -1),answer: JSON.stringify(dd.answer3).slice(1, -1)},
               { id: "7",Labels:"answer4",  question: JSON.stringify(dd.question4).slice(1, -1),answer: JSON.stringify(dd.answer4).slice(1, -1)},
               { id: "8", Labels:"answer5", question: JSON.stringify(dd.question5).slice(1, -1),answer: JSON.stringify(dd.answer5).slice(1, -1)},
               { id: "9",Labels:"answer6",  question: JSON.stringify(dd.question6).slice(1, -1),answer: JSON.stringify(dd.answer6).slice(1, -1)},
               { id: "10", Labels:"answer7", question: JSON.stringify(dd.question7).slice(1, -1),answer: JSON.stringify(dd.answer7).slice(1, -1)},
               { id: "11",Labels:"answer8",  question: JSON.stringify(dd.question8).slice(1, -1),answer: JSON.stringify(dd.answer8).slice(1, -1)},
               { id: "12",Labels:"answer9",  question: JSON.stringify(dd.question9).slice(1, -1),answer: JSON.stringify(dd.answer9).slice(1, -1)},
               { id: "13",Labels:"answer10",  question: JSON.stringify(dd.question10).slice(1, -1),answer: JSON.stringify(dd.answer10).slice(1, -1)},
               { id: "14", Labels:"answer11", question: JSON.stringify(dd.question11).slice(1, -1),answer: JSON.stringify(dd.answer11).slice(1, -1)},
               { id: "15", Labels:"answer12", question: JSON.stringify(dd.question12).slice(1, -1),answer: JSON.stringify(dd.answer12).slice(1, -1)},
               { id: "17", Labels:"answer13", question: JSON.stringify(dd.question13).slice(1, -1),answer: JSON.stringify(dd.answer13).slice(1, -1)}]
      // alert(JSON.stringify(mydata))
       x=JSON.stringify(mydata)
       console.log(x)
        $('#jqGrid').jqGrid('clearGridData');
        $("#jqGrid").jqGrid('setGridParam', { data: mydata});
        $("#jqGrid").trigger('reloadGrid');
        alert(mydata[0].id)


    $("#jqGrid").jqGrid({
        datatype: "local",
        data: mydata,
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

        rowList: [20, 40, 65, 70],
         sortorder: "desc",
        gridview: true,
        autoencode: true,
         cellEdit: false,
        cellsubmit: 'clientArray',
        editurl: 'clientArray',
        viewrecords: true,
        rowNum: 51,
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
            showGrid(resp)
            $("#prevbtn").prop('disabled', false);
            $("#nextBtn").prop('disabled', false);
        },
        error: function(jqXHR, textStatus, errorThrown) {
            alert('No more files!');
        }

        });
}

function GetAllBlob()
{
        var CntStr=$("#SasId").val();
        var Container=$( "#ContainerId option:selected" ).val();

        valu={"ConnectionStr":CntStr,"Container":Container,"blob":blob}
            $.ajax({
        url: 'GetAllBlob',
        type: "POST",
        data:valu,
        async:false,
        success: function(resp, textStatus, jqXHR) {

         },
        error: function(jqXHR, textStatus, errorThrown) {
            alert('Nosdsd more files!');
        }
        });

}
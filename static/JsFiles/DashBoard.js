var ChartData;

am4core.ready(function() {
am4core.useTheme(am4themes_material);
am4core.useTheme(am4themes_animated);
var chart = am4core.create("Spiderchartdiv", am4charts.RadarChart);
  var CntStr="DefaultEndpointsProtocol=https;AccountName=checklistform;AccountKey=dpZeiTIELCgVGxRxqYkhqAx42b8pWND2onchJ83+yXgHqbkMkPS5aKbmmVMtdDJdENFmmH3EuHhANmUQ02d7TQ==;EndpointSuffix=core.windows.net";//$("#SasId").val();
        //var Container="analizedforms";//editedjson  $( "#ContainerId option:selected" ).val();
        var Container="editedjson";
        valu={"ConnectionStr":CntStr,"Container":Container}
            $.ajax({
        url: 'getallblob',
        type: "POST",
        data:valu,
        async:false,
        success: function(resp, textStatus, jqXHR) {
        console.log(JSON.stringify(resp))
        ChartData=resp;

         },
        error: function(jqXHR, textStatus, errorThrown) {
            alert('Error!');
        }
        });
chart.data = //ChartData
[
{
  "Category": "JOB DESIGN",
  "Checked": ((ChartData.Checked.JobDescription)/ChartData.Total.JobDescription_total)*100
}, {
  "Category": "HAZARDOUS MANUAL TASKS",
  "Checked": ((ChartData.Checked.HMT)/ChartData.Total.JobDescription_total)*100
}, {
  "Category": "LIGHTING",
  "Checked": ((ChartData.Checked.Lighting)/ChartData.Total.JobDescription_total)*100
}, {
  "Category": "NOISE",
  "Checked": ((ChartData.Checked.Noise)/ChartData.Total.JobDescription_total)*100
}
];

/* Create axes */
var categoryAxis = chart.xAxes.push(new am4charts.CategoryAxis());
categoryAxis.dataFields.category = "Category";

var valueAxis = chart.yAxes.push(new am4charts.ValueAxis());
valueAxis.renderer.axisFills.template.fill = chart.colors.getIndex(2);
valueAxis.renderer.axisFills.template.fillOpacity = 0.05;

/* Create and configure series */
var series = chart.series.push(new am4charts.RadarSeries());
series.dataFields.valueY = "Checked";
series.dataFields.categoryX = "Category";
series.name = "Sales";
series.strokeWidth = 3;

//====================================================================================================================================



// Themes begin
am4core.useTheme(am4themes_animated);
// Themes end

/**
 * Chart design taken from Samsung health app
 */

var chart = am4core.create("Barchartdiv", am4charts.XYChart);
chart.hiddenState.properties.opacity = 0; // this creates initial fade-in
chart.data =ChartData.DateCountList
//[{'date': '2020-07-09', 'steps': 2},
// {'date': '2020-07-26', 'steps': 4},
// {'date': '2020-07-29', 'steps': 3},
// {'date': '2020-07-30', 'steps': 2},
// {'date': '2020-07-25', 'steps': 1}];

chart.dateFormatter.inputDateFormat = "YYYY-MM-dd";
chart.zoomOutButton.disabled = true;

var dateAxis = chart.xAxes.push(new am4charts.DateAxis());
dateAxis.renderer.grid.template.strokeOpacity = 0;
dateAxis.renderer.minGridDistance = 10;
dateAxis.dateFormats.setKey("day", "d");
dateAxis.tooltip.hiddenState.properties.opacity = 1;
dateAxis.tooltip.hiddenState.properties.visible = true;


dateAxis.tooltip.adapter.add("x", function (x, target) {
    return am4core.utils.spritePointToSvg({ x: chart.plotContainer.pixelX, y: 0 }, chart.plotContainer).x + chart.plotContainer.pixelWidth / 2;
})

var valueAxis = chart.yAxes.push(new am4charts.ValueAxis());
valueAxis.renderer.inside = true;
valueAxis.renderer.labels.template.fillOpacity = 0.3;
valueAxis.renderer.grid.template.strokeOpacity = 0;
valueAxis.min = 0;
valueAxis.cursorTooltipEnabled = false;

// goal guides
var axisRange = valueAxis.axisRanges.create();
axisRange.value = 6000;
axisRange.grid.strokeOpacity = 0.1;
axisRange.label.text = "Goal";
axisRange.label.align = "right";
axisRange.label.verticalCenter = "bottom";
axisRange.label.fillOpacity = 0.8;

valueAxis.renderer.gridContainer.zIndex = 1;

var axisRange2 = valueAxis.axisRanges.create();
axisRange2.value = 12000;
axisRange2.grid.strokeOpacity = 0.1;
axisRange2.label.text = "2x goal";
axisRange2.label.align = "right";
axisRange2.label.verticalCenter = "bottom";
axisRange2.label.fillOpacity = 0.8;

var series = chart.series.push(new am4charts.ColumnSeries);
series.dataFields.valueY = "steps";
series.dataFields.dateX = "date";
series.tooltipText = "{valueY.value}";
series.tooltip.pointerOrientation = "vertical";
series.tooltip.hiddenState.properties.opacity = 1;
series.tooltip.hiddenState.properties.visible = true;
series.tooltip.adapter.add("x", function (x, target) {
    return am4core.utils.spritePointToSvg({ x: chart.plotContainer.pixelX, y: 0 }, chart.plotContainer).x + chart.plotContainer.pixelWidth / 2;
})

var columnTemplate = series.columns.template;
columnTemplate.width = 30;
columnTemplate.column.cornerRadiusTopLeft = 20;
columnTemplate.column.cornerRadiusTopRight = 20;
columnTemplate.strokeOpacity = 0;

columnTemplate.adapter.add("fill", function (fill, target) {
    var dataItem = target.dataItem;
    if (dataItem.valueY > 6) {
        return chart.colors.getIndex(10);
    }
    else {
        return am4core.color("#a8b3b7");
    }
})

var cursor = new am4charts.XYCursor();
cursor.behavior = "panX";
chart.cursor = cursor;
cursor.lineX.disabled = true;

yr=ChartData.Date[0].slice(0,-6)
mt=ChartData.Date[0].slice(5,-3)
day=ChartData.Date[0].slice(8)

//alert(yr +"  "+ mt +"  "+ day)
chart.events.on("datavalidated", function () {
    dateAxis.zoomToDates(new Date(yr, mt-1, day), new Date(yr, mt, day), false, true);
});

var middleLine = chart.plotContainer.createChild(am4core.Line);
middleLine.strokeOpacity = 1;
middleLine.stroke = am4core.color("#000000");
middleLine.strokeDasharray = "2,2";
middleLine.align = "center";
middleLine.zIndex = 1;
middleLine.adapter.add("y2", function (y2, target) {
    return target.parent.pixelHeight;
})

cursor.events.on("cursorpositionchanged", updateTooltip);
dateAxis.events.on("datarangechanged", updateTooltip);

function updateTooltip() {
    dateAxis.showTooltipAtPosition(0.5);
    series.showTooltipAtPosition(0.5, 0);
    series.tooltip.validate(); // otherwise will show other columns values for a second
}


var label = chart.plotContainer.createChild(am4core.Label);
label.text = "Pan chart to change date";
label.x = 90;
label.y = 50;

//================================================================================================================================
am4core.useTheme(am4themes_material);


var chart = am4core.create("Gaugechartdiv", am4charts.GaugeChart);
chart.hiddenState.properties.opacity = 0; // this makes initial fade in effect

chart.innerRadius = -80;
max_val=100//ChartData.Total.JobDescription_total+ChartData.Total.JobDescription_total+ChartData.Total.JobDescription_total+ChartData.Total.JobDescription_total;
var axis = chart.xAxes.push(new am4charts.ValueAxis());
axis.min = 0;
axis.max = max_val
axis.strictMinMax = true;
axis.renderer.grid.template.stroke = new am4core.InterfaceColorSet().getFor("background");
axis.renderer.grid.template.strokeOpacity = 0.9;

var colorSet = new am4core.ColorSet();

var range0 = axis.axisRanges.create();
range0.value = 0;
range0.endValue = max_val/2;
range0.axisFill.fillOpacity = 1;
range0.axisFill.fill = colorSet.getIndex(0);
range0.axisFill.zIndex = - 1;

var range1 = axis.axisRanges.create();
range1.value = max_val/2;
range1.endValue = max_val/(1.3);
range1.axisFill.fillOpacity = 1;
range1.axisFill.fill = colorSet.getIndex(12);
range1.axisFill.zIndex = -1;

var range2 = axis.axisRanges.create();
range2.value = max_val/(1.3);
range2.endValue = max_val;
range2.axisFill.fillOpacity = 1;
range2.axisFill.fill = colorSet.getIndex(10);
range2.axisFill.zIndex = -1;

var hand = chart.hands.push(new am4charts.ClockHand());

// using chart.setTimeout method as the timeout will be disposed together with a chart
chart.setTimeout(randomValue, 2000);

function randomValue() {
    Checked=((ChartData.Checked.JobDescription+ChartData.Checked.HMT+ChartData.Checked.Lighting+ChartData.Checked.Noise)/(ChartData.Total.JobDescription_total+ChartData.Total.JobDescription_total+ChartData.Total.JobDescription_total+ChartData.Total.JobDescription_total))*100
    hand.showValue(Checked, 1000, am4core.ease.cubicOut);
    chart.setTimeout(randomValue, 2000);
}
//alert(((ChartData.Checked.JobDescription+ChartData.Checked.HMT+ChartData.Checked.Lighting+ChartData.Checked.Noise)/(ChartData.Total.JobDescription_total+ChartData.Total.JobDescription_total+ChartData.Total.JobDescription_total+ChartData.Total.JobDescription_total))*100)






}); // end am4core.ready()

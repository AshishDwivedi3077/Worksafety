var ChartData;

am4core.ready(function() {
am4core.useTheme(am4themes_material);
am4core.useTheme(am4themes_animated);
var chart = am4core.create("Spiderchartdiv", am4charts.RadarChart);
  var CntStr="DefaultEndpointsProtocol=https;AccountName=checklistform;AccountKey=dpZeiTIELCgVGxRxqYkhqAx42b8pWND2onchJ83+yXgHqbkMkPS5aKbmmVMtdDJdENFmmH3EuHhANmUQ02d7TQ==;EndpointSuffix=core.windows.net";//$("#SasId").val();
        var Container="analizedforms";//editedjson  $( "#ContainerId option:selected" ).val();

        valu={"ConnectionStr":CntStr,"Container":Container}
            $.ajax({
        url: 'GetAllBlob',
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
  "Checked": ChartData.JobDescription
}, {
  "Category": "HAZARDOUS MANUAL TASKS",
  "Checked": ChartData.HMT
}, {
  "Category": "LIGHTING",
  "Checked": ChartData.Lighting
}, {
  "Category": "NOISE",
  "Checked": ChartData.Noise
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
//am4core.useTheme(am4themes_kelly);
am4core.useTheme(am4themes_animated);

var chart = am4core.create("Barchartdiv", am4charts.XYChart);
chart.hiddenState.properties.opacity = 0; // this creates initial fade-in

chart.data =[
{
  "Category": "JOB DESIGN",
  "Checked": ChartData.JobDescription
}, {
  "Category": "HAZARDOUS MANUAL TASKS",
  "Checked": ChartData.HMT
}, {
  "Category": "LIGHTING",
  "Checked": ChartData.Lighting
}, {
  "Category": "NOISE",
  "Checked": ChartData.Noise
}
]
// Create axes

chart.padding(40, 40, 40, 40);

var categoryAxis = chart.xAxes.push(new am4charts.CategoryAxis());
categoryAxis.renderer.grid.template.location = 0;
categoryAxis.dataFields.category = "Category";
categoryAxis.renderer.minGridDistance = 60;
categoryAxis.renderer.inversed = true;
categoryAxis.renderer.grid.template.disabled = true;

var valueAxis = chart.yAxes.push(new am4charts.ValueAxis());
valueAxis.min = 0;
valueAxis.extraMax = 0.1;
//valueAxis.rangeChangeEasing = am4core.ease.linear;
//valueAxis.rangeChangeDuration = 1500;

var series = chart.series.push(new am4charts.ColumnSeries());
series.dataFields.categoryX = "Category";
series.dataFields.valueY = "Checked";
series.tooltipText = "{valueY.value}"
series.columns.template.strokeOpacity = 0;
series.columns.template.column.cornerRadiusTopRight = 10;
series.columns.template.column.cornerRadiusTopLeft = 10;
//series.interpolationDuration = 1500;
//series.interpolationEasing = am4core.ease.linear;
var labelBullet = series.bullets.push(new am4charts.LabelBullet());
labelBullet.label.verticalCenter = "bottom";
labelBullet.label.dy = -10;
labelBullet.label.text = "{values.valueY.workingValue.formatNumber('#.')}";

chart.zoomOutButton.disabled = true;

// as by default columns of the same series are of the same color, we add adapter which takes colors from chart.colors color set
series.columns.template.adapter.add("fill", function (fill, target) {
 return chart.colors.getIndex(target.dataItem.index);
});

setInterval(function () {
 am4core.array.each(chart.data, function (item) {
   item.visits += Math.round(Math.random() * 200 - 100);
   item.visits = Math.abs(item.visits);
 })
 chart.invalidateRawData();
}, 2000)

categoryAxis.sortBySeries = series;
//================================================================================================================================
am4core.useTheme(am4themes_material);


var chart = am4core.create("Gaugechartdiv", am4charts.GaugeChart);
chart.hiddenState.properties.opacity = 0; // this makes initial fade in effect

chart.innerRadius = -80;

var axis = chart.xAxes.push(new am4charts.ValueAxis());
axis.min = 0;
axis.max = 100;
axis.strictMinMax = true;
axis.renderer.grid.template.stroke = new am4core.InterfaceColorSet().getFor("background");
axis.renderer.grid.template.strokeOpacity = 0.9;

var colorSet = new am4core.ColorSet();

var range0 = axis.axisRanges.create();
range0.value = 0;
range0.endValue = 50;
range0.axisFill.fillOpacity = 1;
range0.axisFill.fill = colorSet.getIndex(0);
range0.axisFill.zIndex = - 1;

var range1 = axis.axisRanges.create();
range1.value = 50;
range1.endValue = 80;
range1.axisFill.fillOpacity = 1;
range1.axisFill.fill = colorSet.getIndex(2);
range1.axisFill.zIndex = -1;

var range2 = axis.axisRanges.create();
range2.value = 80;
range2.endValue = 100;
range2.axisFill.fillOpacity = 1;
range2.axisFill.fill = colorSet.getIndex(4);
range2.axisFill.zIndex = -1;

var hand = chart.hands.push(new am4charts.ClockHand());

// using chart.setTimeout method as the timeout will be disposed together with a chart
chart.setTimeout(randomValue, 2000);

function randomValue() {
    hand.showValue(Math.random() * 100, 1000, am4core.ease.cubicOut);
    chart.setTimeout(randomValue, 2000);
}







}); // end am4core.ready()

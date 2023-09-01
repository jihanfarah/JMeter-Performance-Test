/*
   Licensed to the Apache Software Foundation (ASF) under one or more
   contributor license agreements.  See the NOTICE file distributed with
   this work for additional information regarding copyright ownership.
   The ASF licenses this file to You under the Apache License, Version 2.0
   (the "License"); you may not use this file except in compliance with
   the License.  You may obtain a copy of the License at

       http://www.apache.org/licenses/LICENSE-2.0

   Unless required by applicable law or agreed to in writing, software
   distributed under the License is distributed on an "AS IS" BASIS,
   WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
   See the License for the specific language governing permissions and
   limitations under the License.
*/
var showControllersOnly = false;
var seriesFilter = "";
var filtersOnlySampleSeries = true;

/*
 * Add header in statistics table to group metrics by category
 * format
 *
 */
function summaryTableHeader(header) {
    var newRow = header.insertRow(-1);
    newRow.className = "tablesorter-no-sort";
    var cell = document.createElement('th');
    cell.setAttribute("data-sorter", false);
    cell.colSpan = 1;
    cell.innerHTML = "Requests";
    newRow.appendChild(cell);

    cell = document.createElement('th');
    cell.setAttribute("data-sorter", false);
    cell.colSpan = 3;
    cell.innerHTML = "Executions";
    newRow.appendChild(cell);

    cell = document.createElement('th');
    cell.setAttribute("data-sorter", false);
    cell.colSpan = 7;
    cell.innerHTML = "Response Times (ms)";
    newRow.appendChild(cell);

    cell = document.createElement('th');
    cell.setAttribute("data-sorter", false);
    cell.colSpan = 1;
    cell.innerHTML = "Throughput";
    newRow.appendChild(cell);

    cell = document.createElement('th');
    cell.setAttribute("data-sorter", false);
    cell.colSpan = 2;
    cell.innerHTML = "Network (KB/sec)";
    newRow.appendChild(cell);
}

/*
 * Populates the table identified by id parameter with the specified data and
 * format
 *
 */
function createTable(table, info, formatter, defaultSorts, seriesIndex, headerCreator) {
    var tableRef = table[0];

    // Create header and populate it with data.titles array
    var header = tableRef.createTHead();

    // Call callback is available
    if(headerCreator) {
        headerCreator(header);
    }

    var newRow = header.insertRow(-1);
    for (var index = 0; index < info.titles.length; index++) {
        var cell = document.createElement('th');
        cell.innerHTML = info.titles[index];
        newRow.appendChild(cell);
    }

    var tBody;

    // Create overall body if defined
    if(info.overall){
        tBody = document.createElement('tbody');
        tBody.className = "tablesorter-no-sort";
        tableRef.appendChild(tBody);
        var newRow = tBody.insertRow(-1);
        var data = info.overall.data;
        for(var index=0;index < data.length; index++){
            var cell = newRow.insertCell(-1);
            cell.innerHTML = formatter ? formatter(index, data[index]): data[index];
        }
    }

    // Create regular body
    tBody = document.createElement('tbody');
    tableRef.appendChild(tBody);

    var regexp;
    if(seriesFilter) {
        regexp = new RegExp(seriesFilter, 'i');
    }
    // Populate body with data.items array
    for(var index=0; index < info.items.length; index++){
        var item = info.items[index];
        if((!regexp || filtersOnlySampleSeries && !info.supportsControllersDiscrimination || regexp.test(item.data[seriesIndex]))
                &&
                (!showControllersOnly || !info.supportsControllersDiscrimination || item.isController)){
            if(item.data.length > 0) {
                var newRow = tBody.insertRow(-1);
                for(var col=0; col < item.data.length; col++){
                    var cell = newRow.insertCell(-1);
                    cell.innerHTML = formatter ? formatter(col, item.data[col]) : item.data[col];
                }
            }
        }
    }

    // Add support of columns sort
    table.tablesorter({sortList : defaultSorts});
}

$(document).ready(function() {

    // Customize table sorter default options
    $.extend( $.tablesorter.defaults, {
        theme: 'blue',
        cssInfoBlock: "tablesorter-no-sort",
        widthFixed: true,
        widgets: ['zebra']
    });

    var data = {"OkPercent": 11.549482036588055, "KoPercent": 88.45051796341194};
    var dataset = [
        {
            "label" : "FAIL",
            "data" : data.KoPercent,
            "color" : "#FF6347"
        },
        {
            "label" : "PASS",
            "data" : data.OkPercent,
            "color" : "#9ACD32"
        }];
    $.plot($("#flot-requests-summary"), dataset, {
        series : {
            pie : {
                show : true,
                radius : 1,
                label : {
                    show : true,
                    radius : 3 / 4,
                    formatter : function(label, series) {
                        return '<div style="font-size:8pt;text-align:center;padding:2px;color:white;">'
                            + label
                            + '<br/>'
                            + Math.round10(series.percent, -2)
                            + '%</div>';
                    },
                    background : {
                        opacity : 0.5,
                        color : '#000'
                    }
                }
            }
        },
        legend : {
            show : true
        }
    });

    // Creates APDEX table
    createTable($("#apdexTable"), {"supportsControllersDiscrimination": true, "overall": {"data": [0.11163764602160017, 500, 1500, "Total"], "isController": false}, "titles": ["Apdex", "T (Toleration threshold)", "F (Frustration threshold)", "Label"], "items": [{"data": [0.1290983606557377, 500, 1500, "Get All To-dos"], "isController": false}, {"data": [0.0739038189533239, 500, 1500, "Get All Users"], "isController": false}, {"data": [0.12344028520499109, 500, 1500, "Get All Posts"], "isController": false}, {"data": [0.13414634146341464, 500, 1500, "Get All Comments"], "isController": false}]}, function(index, item){
        switch(index){
            case 0:
                item = item.toFixed(3);
                break;
            case 1:
            case 2:
                item = formatDuration(item);
                break;
        }
        return item;
    }, [[0, 0]], 3);

    // Create statistics table
    createTable($("#statisticsTable"), {"supportsControllersDiscrimination": true, "overall": {"data": ["Total", 4537, 4013, 88.45051796341194, 7747.32069649549, 86, 69179, 172.0, 40886.4, 60800.1, 66850.73999999999, 60.227529171257515, 80.09956682839734, 12.97937135359281], "isController": false}, "titles": ["Label", "#Samples", "FAIL", "Error %", "Average", "Min", "Max", "Median", "90th pct", "95th pct", "99th pct", "Transactions/s", "Received", "Sent"], "items": [{"data": ["Get All To-dos", 976, 848, 86.88524590163935, 2462.248975409836, 87, 61693, 127.0, 454.40000000000055, 26992.749999999993, 51553.75000000002, 14.116898332296746, 17.655304187699784, 3.0329273760793787], "isController": false}, {"data": ["Get All Users", 1414, 1304, 92.22065063649222, 17959.099009900983, 91, 69179, 371.5, 63343.0, 66054.25, 68506.09999999999, 18.793444888953868, 23.084030036782785, 4.037654175361182], "isController": false}, {"data": ["Get All Posts", 1122, 976, 86.98752228163993, 4706.6559714795, 87, 62070, 137.0, 17309.60000000001, 47784.699999999924, 60291.43, 16.03911141607342, 25.467614767382855, 3.445902843297024], "isController": false}, {"data": ["Get All Comments", 1025, 885, 86.34146341463415, 2020.8829268292689, 86, 62039, 127.0, 346.4, 15017.999999999998, 48945.96, 14.806147801467615, 18.705795974894553, 3.22438570285867], "isController": false}]}, function(index, item){
        switch(index){
            // Errors pct
            case 3:
                item = item.toFixed(2) + '%';
                break;
            // Mean
            case 4:
            // Mean
            case 7:
            // Median
            case 8:
            // Percentile 1
            case 9:
            // Percentile 2
            case 10:
            // Percentile 3
            case 11:
            // Throughput
            case 12:
            // Kbytes/s
            case 13:
            // Sent Kbytes/s
                item = item.toFixed(2);
                break;
        }
        return item;
    }, [[0, 0]], 0, summaryTableHeader);

    // Create error table
    createTable($("#errorsTable"), {"supportsControllersDiscrimination": false, "titles": ["Type of error", "Number of errors", "% in errors", "% in all samples"], "items": [{"data": ["The operation lasted too long: It took 57,318 milliseconds, but should not have lasted longer than 2,000 milliseconds.", 1, 0.024919013207076998, 0.02204099625303064], "isController": false}, {"data": ["The operation lasted too long: It took 7,316 milliseconds, but should not have lasted longer than 2,000 milliseconds.", 1, 0.024919013207076998, 0.02204099625303064], "isController": false}, {"data": ["The operation lasted too long: It took 7,309 milliseconds, but should not have lasted longer than 2,000 milliseconds.", 1, 0.024919013207076998, 0.02204099625303064], "isController": false}, {"data": ["The operation lasted too long: It took 6,843 milliseconds, but should not have lasted longer than 2,000 milliseconds.", 1, 0.024919013207076998, 0.02204099625303064], "isController": false}, {"data": ["The operation lasted too long: It took 5,413 milliseconds, but should not have lasted longer than 2,000 milliseconds.", 1, 0.024919013207076998, 0.02204099625303064], "isController": false}, {"data": ["429/Too Many Requests", 3865, 96.3119860453526, 85.18845051796342], "isController": false}, {"data": ["The operation lasted too long: It took 6,254 milliseconds, but should not have lasted longer than 2,000 milliseconds.", 1, 0.024919013207076998, 0.02204099625303064], "isController": false}, {"data": ["The operation lasted too long: It took 6,530 milliseconds, but should not have lasted longer than 2,000 milliseconds.", 1, 0.024919013207076998, 0.02204099625303064], "isController": false}, {"data": ["The operation lasted too long: It took 60,399 milliseconds, but should not have lasted longer than 2,000 milliseconds.", 1, 0.024919013207076998, 0.02204099625303064], "isController": false}, {"data": ["The operation lasted too long: It took 64,225 milliseconds, but should not have lasted longer than 2,000 milliseconds.", 1, 0.024919013207076998, 0.02204099625303064], "isController": false}, {"data": ["The operation lasted too long: It took 52,109 milliseconds, but should not have lasted longer than 2,000 milliseconds.", 1, 0.024919013207076998, 0.02204099625303064], "isController": false}, {"data": ["The operation lasted too long: It took 27,637 milliseconds, but should not have lasted longer than 2,000 milliseconds.", 1, 0.024919013207076998, 0.02204099625303064], "isController": false}, {"data": ["The operation lasted too long: It took 5,771 milliseconds, but should not have lasted longer than 2,000 milliseconds.", 1, 0.024919013207076998, 0.02204099625303064], "isController": false}, {"data": ["The operation lasted too long: It took 20,747 milliseconds, but should not have lasted longer than 2,000 milliseconds.", 1, 0.024919013207076998, 0.02204099625303064], "isController": false}, {"data": ["The operation lasted too long: It took 57,635 milliseconds, but should not have lasted longer than 2,000 milliseconds.", 1, 0.024919013207076998, 0.02204099625303064], "isController": false}, {"data": ["The operation lasted too long: It took 7,202 milliseconds, but should not have lasted longer than 2,000 milliseconds.", 1, 0.024919013207076998, 0.02204099625303064], "isController": false}, {"data": ["The operation lasted too long: It took 9,616 milliseconds, but should not have lasted longer than 2,000 milliseconds.", 1, 0.024919013207076998, 0.02204099625303064], "isController": false}, {"data": ["The operation lasted too long: It took 6,624 milliseconds, but should not have lasted longer than 2,000 milliseconds.", 1, 0.024919013207076998, 0.02204099625303064], "isController": false}, {"data": ["The operation lasted too long: It took 65,571 milliseconds, but should not have lasted longer than 2,000 milliseconds.", 1, 0.024919013207076998, 0.02204099625303064], "isController": false}, {"data": ["The operation lasted too long: It took 7,421 milliseconds, but should not have lasted longer than 2,000 milliseconds.", 1, 0.024919013207076998, 0.02204099625303064], "isController": false}, {"data": ["The operation lasted too long: It took 7,253 milliseconds, but should not have lasted longer than 2,000 milliseconds.", 1, 0.024919013207076998, 0.02204099625303064], "isController": false}, {"data": ["The operation lasted too long: It took 26,938 milliseconds, but should not have lasted longer than 2,000 milliseconds.", 1, 0.024919013207076998, 0.02204099625303064], "isController": false}, {"data": ["The operation lasted too long: It took 5,716 milliseconds, but should not have lasted longer than 2,000 milliseconds.", 1, 0.024919013207076998, 0.02204099625303064], "isController": false}, {"data": ["The operation lasted too long: It took 20,788 milliseconds, but should not have lasted longer than 2,000 milliseconds.", 1, 0.024919013207076998, 0.02204099625303064], "isController": false}, {"data": ["The operation lasted too long: It took 5,195 milliseconds, but should not have lasted longer than 2,000 milliseconds.", 1, 0.024919013207076998, 0.02204099625303064], "isController": false}, {"data": ["The operation lasted too long: It took 6,108 milliseconds, but should not have lasted longer than 2,000 milliseconds.", 1, 0.024919013207076998, 0.02204099625303064], "isController": false}, {"data": ["The operation lasted too long: It took 39,350 milliseconds, but should not have lasted longer than 2,000 milliseconds.", 1, 0.024919013207076998, 0.02204099625303064], "isController": false}, {"data": ["The operation lasted too long: It took 5,474 milliseconds, but should not have lasted longer than 2,000 milliseconds.", 1, 0.024919013207076998, 0.02204099625303064], "isController": false}, {"data": ["The operation lasted too long: It took 5,340 milliseconds, but should not have lasted longer than 2,000 milliseconds.", 1, 0.024919013207076998, 0.02204099625303064], "isController": false}, {"data": ["The operation lasted too long: It took 5,720 milliseconds, but should not have lasted longer than 2,000 milliseconds.", 1, 0.024919013207076998, 0.02204099625303064], "isController": false}, {"data": ["The operation lasted too long: It took 19,857 milliseconds, but should not have lasted longer than 2,000 milliseconds.", 1, 0.024919013207076998, 0.02204099625303064], "isController": false}, {"data": ["The operation lasted too long: It took 54,723 milliseconds, but should not have lasted longer than 2,000 milliseconds.", 1, 0.024919013207076998, 0.02204099625303064], "isController": false}, {"data": ["The operation lasted too long: It took 64,905 milliseconds, but should not have lasted longer than 2,000 milliseconds.", 1, 0.024919013207076998, 0.02204099625303064], "isController": false}, {"data": ["The operation lasted too long: It took 43,768 milliseconds, but should not have lasted longer than 2,000 milliseconds.", 1, 0.024919013207076998, 0.02204099625303064], "isController": false}, {"data": ["The operation lasted too long: It took 5,586 milliseconds, but should not have lasted longer than 2,000 milliseconds.", 1, 0.024919013207076998, 0.02204099625303064], "isController": false}, {"data": ["The operation lasted too long: It took 69,127 milliseconds, but should not have lasted longer than 2,000 milliseconds.", 1, 0.024919013207076998, 0.02204099625303064], "isController": false}, {"data": ["The operation lasted too long: It took 6,282 milliseconds, but should not have lasted longer than 2,000 milliseconds.", 1, 0.024919013207076998, 0.02204099625303064], "isController": false}, {"data": ["The operation lasted too long: It took 21,471 milliseconds, but should not have lasted longer than 2,000 milliseconds.", 1, 0.024919013207076998, 0.02204099625303064], "isController": false}, {"data": ["The operation lasted too long: It took 15,004 milliseconds, but should not have lasted longer than 2,000 milliseconds.", 1, 0.024919013207076998, 0.02204099625303064], "isController": false}, {"data": ["The operation lasted too long: It took 8,061 milliseconds, but should not have lasted longer than 2,000 milliseconds.", 1, 0.024919013207076998, 0.02204099625303064], "isController": false}, {"data": ["The operation lasted too long: It took 39,374 milliseconds, but should not have lasted longer than 2,000 milliseconds.", 1, 0.024919013207076998, 0.02204099625303064], "isController": false}, {"data": ["The operation lasted too long: It took 64,258 milliseconds, but should not have lasted longer than 2,000 milliseconds.", 1, 0.024919013207076998, 0.02204099625303064], "isController": false}, {"data": ["The operation lasted too long: It took 7,945 milliseconds, but should not have lasted longer than 2,000 milliseconds.", 1, 0.024919013207076998, 0.02204099625303064], "isController": false}, {"data": ["The operation lasted too long: It took 6,489 milliseconds, but should not have lasted longer than 2,000 milliseconds.", 1, 0.024919013207076998, 0.02204099625303064], "isController": false}, {"data": ["The operation lasted too long: It took 5,949 milliseconds, but should not have lasted longer than 2,000 milliseconds.", 1, 0.024919013207076998, 0.02204099625303064], "isController": false}, {"data": ["The operation lasted too long: It took 65,428 milliseconds, but should not have lasted longer than 2,000 milliseconds.", 1, 0.024919013207076998, 0.02204099625303064], "isController": false}, {"data": ["The operation lasted too long: It took 6,527 milliseconds, but should not have lasted longer than 2,000 milliseconds.", 1, 0.024919013207076998, 0.02204099625303064], "isController": false}, {"data": ["The operation lasted too long: It took 6,068 milliseconds, but should not have lasted longer than 2,000 milliseconds.", 1, 0.024919013207076998, 0.02204099625303064], "isController": false}, {"data": ["The operation lasted too long: It took 6,731 milliseconds, but should not have lasted longer than 2,000 milliseconds.", 1, 0.024919013207076998, 0.02204099625303064], "isController": false}, {"data": ["The operation lasted too long: It took 7,071 milliseconds, but should not have lasted longer than 2,000 milliseconds.", 1, 0.024919013207076998, 0.02204099625303064], "isController": false}, {"data": ["The operation lasted too long: It took 7,238 milliseconds, but should not have lasted longer than 2,000 milliseconds.", 1, 0.024919013207076998, 0.02204099625303064], "isController": false}, {"data": ["The operation lasted too long: It took 66,834 milliseconds, but should not have lasted longer than 2,000 milliseconds.", 1, 0.024919013207076998, 0.02204099625303064], "isController": false}, {"data": ["The operation lasted too long: It took 43,716 milliseconds, but should not have lasted longer than 2,000 milliseconds.", 1, 0.024919013207076998, 0.02204099625303064], "isController": false}, {"data": ["The operation lasted too long: It took 10,768 milliseconds, but should not have lasted longer than 2,000 milliseconds.", 1, 0.024919013207076998, 0.02204099625303064], "isController": false}, {"data": ["The operation lasted too long: It took 5,681 milliseconds, but should not have lasted longer than 2,000 milliseconds.", 2, 0.049838026414153996, 0.04408199250606128], "isController": false}, {"data": ["The operation lasted too long: It took 52,909 milliseconds, but should not have lasted longer than 2,000 milliseconds.", 1, 0.024919013207076998, 0.02204099625303064], "isController": false}, {"data": ["The operation lasted too long: It took 5,519 milliseconds, but should not have lasted longer than 2,000 milliseconds.", 1, 0.024919013207076998, 0.02204099625303064], "isController": false}, {"data": ["The operation lasted too long: It took 6,777 milliseconds, but should not have lasted longer than 2,000 milliseconds.", 1, 0.024919013207076998, 0.02204099625303064], "isController": false}, {"data": ["The operation lasted too long: It took 48,551 milliseconds, but should not have lasted longer than 2,000 milliseconds.", 1, 0.024919013207076998, 0.02204099625303064], "isController": false}, {"data": ["The operation lasted too long: It took 5,973 milliseconds, but should not have lasted longer than 2,000 milliseconds.", 1, 0.024919013207076998, 0.02204099625303064], "isController": false}, {"data": ["The operation lasted too long: It took 7,124 milliseconds, but should not have lasted longer than 2,000 milliseconds.", 1, 0.024919013207076998, 0.02204099625303064], "isController": false}, {"data": ["The operation lasted too long: It took 5,861 milliseconds, but should not have lasted longer than 2,000 milliseconds.", 1, 0.024919013207076998, 0.02204099625303064], "isController": false}, {"data": ["The operation lasted too long: It took 62,066 milliseconds, but should not have lasted longer than 2,000 milliseconds.", 1, 0.024919013207076998, 0.02204099625303064], "isController": false}, {"data": ["The operation lasted too long: It took 15,050 milliseconds, but should not have lasted longer than 2,000 milliseconds.", 1, 0.024919013207076998, 0.02204099625303064], "isController": false}, {"data": ["The operation lasted too long: It took 2,407 milliseconds, but should not have lasted longer than 2,000 milliseconds.", 1, 0.024919013207076998, 0.02204099625303064], "isController": false}, {"data": ["The operation lasted too long: It took 6,544 milliseconds, but should not have lasted longer than 2,000 milliseconds.", 1, 0.024919013207076998, 0.02204099625303064], "isController": false}, {"data": ["The operation lasted too long: It took 7,047 milliseconds, but should not have lasted longer than 2,000 milliseconds.", 1, 0.024919013207076998, 0.02204099625303064], "isController": false}, {"data": ["The operation lasted too long: It took 11,258 milliseconds, but should not have lasted longer than 2,000 milliseconds.", 1, 0.024919013207076998, 0.02204099625303064], "isController": false}, {"data": ["The operation lasted too long: It took 10,305 milliseconds, but should not have lasted longer than 2,000 milliseconds.", 1, 0.024919013207076998, 0.02204099625303064], "isController": false}, {"data": ["The operation lasted too long: It took 5,492 milliseconds, but should not have lasted longer than 2,000 milliseconds.", 1, 0.024919013207076998, 0.02204099625303064], "isController": false}, {"data": ["The operation lasted too long: It took 5,650 milliseconds, but should not have lasted longer than 2,000 milliseconds.", 1, 0.024919013207076998, 0.02204099625303064], "isController": false}, {"data": ["The operation lasted too long: It took 7,352 milliseconds, but should not have lasted longer than 2,000 milliseconds.", 1, 0.024919013207076998, 0.02204099625303064], "isController": false}, {"data": ["The operation lasted too long: It took 6,127 milliseconds, but should not have lasted longer than 2,000 milliseconds.", 1, 0.024919013207076998, 0.02204099625303064], "isController": false}, {"data": ["The operation lasted too long: It took 59,393 milliseconds, but should not have lasted longer than 2,000 milliseconds.", 1, 0.024919013207076998, 0.02204099625303064], "isController": false}, {"data": ["The operation lasted too long: It took 20,872 milliseconds, but should not have lasted longer than 2,000 milliseconds.", 1, 0.024919013207076998, 0.02204099625303064], "isController": false}, {"data": ["The operation lasted too long: It took 5,470 milliseconds, but should not have lasted longer than 2,000 milliseconds.", 1, 0.024919013207076998, 0.02204099625303064], "isController": false}, {"data": ["The operation lasted too long: It took 6,913 milliseconds, but should not have lasted longer than 2,000 milliseconds.", 1, 0.024919013207076998, 0.02204099625303064], "isController": false}, {"data": ["The operation lasted too long: It took 5,200 milliseconds, but should not have lasted longer than 2,000 milliseconds.", 1, 0.024919013207076998, 0.02204099625303064], "isController": false}, {"data": ["The operation lasted too long: It took 53,532 milliseconds, but should not have lasted longer than 2,000 milliseconds.", 1, 0.024919013207076998, 0.02204099625303064], "isController": false}, {"data": ["The operation lasted too long: It took 6,443 milliseconds, but should not have lasted longer than 2,000 milliseconds.", 1, 0.024919013207076998, 0.02204099625303064], "isController": false}, {"data": ["The operation lasted too long: It took 20,813 milliseconds, but should not have lasted longer than 2,000 milliseconds.", 1, 0.024919013207076998, 0.02204099625303064], "isController": false}, {"data": ["The operation lasted too long: It took 6,709 milliseconds, but should not have lasted longer than 2,000 milliseconds.", 1, 0.024919013207076998, 0.02204099625303064], "isController": false}, {"data": ["The operation lasted too long: It took 15,024 milliseconds, but should not have lasted longer than 2,000 milliseconds.", 1, 0.024919013207076998, 0.02204099625303064], "isController": false}, {"data": ["The operation lasted too long: It took 6,074 milliseconds, but should not have lasted longer than 2,000 milliseconds.", 1, 0.024919013207076998, 0.02204099625303064], "isController": false}, {"data": ["The operation lasted too long: It took 27,340 milliseconds, but should not have lasted longer than 2,000 milliseconds.", 1, 0.024919013207076998, 0.02204099625303064], "isController": false}, {"data": ["The operation lasted too long: It took 5,108 milliseconds, but should not have lasted longer than 2,000 milliseconds.", 1, 0.024919013207076998, 0.02204099625303064], "isController": false}, {"data": ["The operation lasted too long: It took 7,126 milliseconds, but should not have lasted longer than 2,000 milliseconds.", 1, 0.024919013207076998, 0.02204099625303064], "isController": false}, {"data": ["The operation lasted too long: It took 4,999 milliseconds, but should not have lasted longer than 2,000 milliseconds.", 1, 0.024919013207076998, 0.02204099625303064], "isController": false}, {"data": ["The operation lasted too long: It took 58,803 milliseconds, but should not have lasted longer than 2,000 milliseconds.", 1, 0.024919013207076998, 0.02204099625303064], "isController": false}, {"data": ["The operation lasted too long: It took 28,624 milliseconds, but should not have lasted longer than 2,000 milliseconds.", 1, 0.024919013207076998, 0.02204099625303064], "isController": false}, {"data": ["The operation lasted too long: It took 67,550 milliseconds, but should not have lasted longer than 2,000 milliseconds.", 1, 0.024919013207076998, 0.02204099625303064], "isController": false}, {"data": ["The operation lasted too long: It took 43,819 milliseconds, but should not have lasted longer than 2,000 milliseconds.", 1, 0.024919013207076998, 0.02204099625303064], "isController": false}, {"data": ["The operation lasted too long: It took 12,198 milliseconds, but should not have lasted longer than 2,000 milliseconds.", 1, 0.024919013207076998, 0.02204099625303064], "isController": false}, {"data": ["The operation lasted too long: It took 10,251 milliseconds, but should not have lasted longer than 2,000 milliseconds.", 1, 0.024919013207076998, 0.02204099625303064], "isController": false}, {"data": ["The operation lasted too long: It took 51,295 milliseconds, but should not have lasted longer than 2,000 milliseconds.", 1, 0.024919013207076998, 0.02204099625303064], "isController": false}, {"data": ["The operation lasted too long: It took 6,650 milliseconds, but should not have lasted longer than 2,000 milliseconds.", 1, 0.024919013207076998, 0.02204099625303064], "isController": false}, {"data": ["The operation lasted too long: It took 66,275 milliseconds, but should not have lasted longer than 2,000 milliseconds.", 1, 0.024919013207076998, 0.02204099625303064], "isController": false}, {"data": ["The operation lasted too long: It took 9,134 milliseconds, but should not have lasted longer than 2,000 milliseconds.", 1, 0.024919013207076998, 0.02204099625303064], "isController": false}, {"data": ["The operation lasted too long: It took 61,237 milliseconds, but should not have lasted longer than 2,000 milliseconds.", 1, 0.024919013207076998, 0.02204099625303064], "isController": false}, {"data": ["The operation lasted too long: It took 6,215 milliseconds, but should not have lasted longer than 2,000 milliseconds.", 1, 0.024919013207076998, 0.02204099625303064], "isController": false}, {"data": ["The operation lasted too long: It took 27,628 milliseconds, but should not have lasted longer than 2,000 milliseconds.", 1, 0.024919013207076998, 0.02204099625303064], "isController": false}, {"data": ["The operation lasted too long: It took 7,917 milliseconds, but should not have lasted longer than 2,000 milliseconds.", 1, 0.024919013207076998, 0.02204099625303064], "isController": false}, {"data": ["The operation lasted too long: It took 5,459 milliseconds, but should not have lasted longer than 2,000 milliseconds.", 1, 0.024919013207076998, 0.02204099625303064], "isController": false}, {"data": ["The operation lasted too long: It took 5,631 milliseconds, but should not have lasted longer than 2,000 milliseconds.", 1, 0.024919013207076998, 0.02204099625303064], "isController": false}, {"data": ["The operation lasted too long: It took 6,740 milliseconds, but should not have lasted longer than 2,000 milliseconds.", 1, 0.024919013207076998, 0.02204099625303064], "isController": false}, {"data": ["The operation lasted too long: It took 39,395 milliseconds, but should not have lasted longer than 2,000 milliseconds.", 1, 0.024919013207076998, 0.02204099625303064], "isController": false}, {"data": ["The operation lasted too long: It took 6,283 milliseconds, but should not have lasted longer than 2,000 milliseconds.", 1, 0.024919013207076998, 0.02204099625303064], "isController": false}, {"data": ["The operation lasted too long: It took 6,088 milliseconds, but should not have lasted longer than 2,000 milliseconds.", 1, 0.024919013207076998, 0.02204099625303064], "isController": false}, {"data": ["The operation lasted too long: It took 8,048 milliseconds, but should not have lasted longer than 2,000 milliseconds.", 1, 0.024919013207076998, 0.02204099625303064], "isController": false}, {"data": ["The operation lasted too long: It took 61,693 milliseconds, but should not have lasted longer than 2,000 milliseconds.", 1, 0.024919013207076998, 0.02204099625303064], "isController": false}, {"data": ["The operation lasted too long: It took 7,086 milliseconds, but should not have lasted longer than 2,000 milliseconds.", 1, 0.024919013207076998, 0.02204099625303064], "isController": false}, {"data": ["The operation lasted too long: It took 5,449 milliseconds, but should not have lasted longer than 2,000 milliseconds.", 1, 0.024919013207076998, 0.02204099625303064], "isController": false}, {"data": ["The operation lasted too long: It took 4,924 milliseconds, but should not have lasted longer than 2,000 milliseconds.", 1, 0.024919013207076998, 0.02204099625303064], "isController": false}, {"data": ["The operation lasted too long: It took 6,371 milliseconds, but should not have lasted longer than 2,000 milliseconds.", 1, 0.024919013207076998, 0.02204099625303064], "isController": false}, {"data": ["The operation lasted too long: It took 5,285 milliseconds, but should not have lasted longer than 2,000 milliseconds.", 1, 0.024919013207076998, 0.02204099625303064], "isController": false}, {"data": ["The operation lasted too long: It took 64,118 milliseconds, but should not have lasted longer than 2,000 milliseconds.", 1, 0.024919013207076998, 0.02204099625303064], "isController": false}, {"data": ["The operation lasted too long: It took 68,973 milliseconds, but should not have lasted longer than 2,000 milliseconds.", 1, 0.024919013207076998, 0.02204099625303064], "isController": false}, {"data": ["The operation lasted too long: It took 22,914 milliseconds, but should not have lasted longer than 2,000 milliseconds.", 1, 0.024919013207076998, 0.02204099625303064], "isController": false}, {"data": ["The operation lasted too long: It took 34,058 milliseconds, but should not have lasted longer than 2,000 milliseconds.", 1, 0.024919013207076998, 0.02204099625303064], "isController": false}, {"data": ["The operation lasted too long: It took 6,515 milliseconds, but should not have lasted longer than 2,000 milliseconds.", 1, 0.024919013207076998, 0.02204099625303064], "isController": false}, {"data": ["The operation lasted too long: It took 10,378 milliseconds, but should not have lasted longer than 2,000 milliseconds.", 1, 0.024919013207076998, 0.02204099625303064], "isController": false}, {"data": ["The operation lasted too long: It took 33,457 milliseconds, but should not have lasted longer than 2,000 milliseconds.", 1, 0.024919013207076998, 0.02204099625303064], "isController": false}, {"data": ["The operation lasted too long: It took 7,004 milliseconds, but should not have lasted longer than 2,000 milliseconds.", 1, 0.024919013207076998, 0.02204099625303064], "isController": false}, {"data": ["The operation lasted too long: It took 5,491 milliseconds, but should not have lasted longer than 2,000 milliseconds.", 1, 0.024919013207076998, 0.02204099625303064], "isController": false}, {"data": ["The operation lasted too long: It took 6,084 milliseconds, but should not have lasted longer than 2,000 milliseconds.", 1, 0.024919013207076998, 0.02204099625303064], "isController": false}, {"data": ["The operation lasted too long: It took 7,863 milliseconds, but should not have lasted longer than 2,000 milliseconds.", 1, 0.024919013207076998, 0.02204099625303064], "isController": false}, {"data": ["The operation lasted too long: It took 6,739 milliseconds, but should not have lasted longer than 2,000 milliseconds.", 1, 0.024919013207076998, 0.02204099625303064], "isController": false}, {"data": ["The operation lasted too long: It took 7,252 milliseconds, but should not have lasted longer than 2,000 milliseconds.", 1, 0.024919013207076998, 0.02204099625303064], "isController": false}, {"data": ["The operation lasted too long: It took 6,378 milliseconds, but should not have lasted longer than 2,000 milliseconds.", 1, 0.024919013207076998, 0.02204099625303064], "isController": false}, {"data": ["The operation lasted too long: It took 6,315 milliseconds, but should not have lasted longer than 2,000 milliseconds.", 1, 0.024919013207076998, 0.02204099625303064], "isController": false}, {"data": ["The operation lasted too long: It took 6,255 milliseconds, but should not have lasted longer than 2,000 milliseconds.", 1, 0.024919013207076998, 0.02204099625303064], "isController": false}, {"data": ["The operation lasted too long: It took 61,191 milliseconds, but should not have lasted longer than 2,000 milliseconds.", 1, 0.024919013207076998, 0.02204099625303064], "isController": false}, {"data": ["The operation lasted too long: It took 58,722 milliseconds, but should not have lasted longer than 2,000 milliseconds.", 1, 0.024919013207076998, 0.02204099625303064], "isController": false}, {"data": ["The operation lasted too long: It took 7,052 milliseconds, but should not have lasted longer than 2,000 milliseconds.", 1, 0.024919013207076998, 0.02204099625303064], "isController": false}, {"data": ["The operation lasted too long: It took 37,904 milliseconds, but should not have lasted longer than 2,000 milliseconds.", 1, 0.024919013207076998, 0.02204099625303064], "isController": false}, {"data": ["The operation lasted too long: It took 6,888 milliseconds, but should not have lasted longer than 2,000 milliseconds.", 1, 0.024919013207076998, 0.02204099625303064], "isController": false}, {"data": ["The operation lasted too long: It took 7,050 milliseconds, but should not have lasted longer than 2,000 milliseconds.", 1, 0.024919013207076998, 0.02204099625303064], "isController": false}, {"data": ["The operation lasted too long: It took 60,789 milliseconds, but should not have lasted longer than 2,000 milliseconds.", 1, 0.024919013207076998, 0.02204099625303064], "isController": false}, {"data": ["The operation lasted too long: It took 66,178 milliseconds, but should not have lasted longer than 2,000 milliseconds.", 1, 0.024919013207076998, 0.02204099625303064], "isController": false}, {"data": ["The operation lasted too long: It took 5,210 milliseconds, but should not have lasted longer than 2,000 milliseconds.", 1, 0.024919013207076998, 0.02204099625303064], "isController": false}, {"data": ["The operation lasted too long: It took 6,543 milliseconds, but should not have lasted longer than 2,000 milliseconds.", 1, 0.024919013207076998, 0.02204099625303064], "isController": false}, {"data": ["The operation lasted too long: It took 15,058 milliseconds, but should not have lasted longer than 2,000 milliseconds.", 1, 0.024919013207076998, 0.02204099625303064], "isController": false}, {"data": ["The operation lasted too long: It took 5,221 milliseconds, but should not have lasted longer than 2,000 milliseconds.", 2, 0.049838026414153996, 0.04408199250606128], "isController": false}, {"data": ["The operation lasted too long: It took 6,892 milliseconds, but should not have lasted longer than 2,000 milliseconds.", 1, 0.024919013207076998, 0.02204099625303064], "isController": false}, {"data": ["The operation lasted too long: It took 5,974 milliseconds, but should not have lasted longer than 2,000 milliseconds.", 1, 0.024919013207076998, 0.02204099625303064], "isController": false}, {"data": ["The operation lasted too long: It took 5,021 milliseconds, but should not have lasted longer than 2,000 milliseconds.", 1, 0.024919013207076998, 0.02204099625303064], "isController": false}, {"data": ["The operation lasted too long: It took 6,398 milliseconds, but should not have lasted longer than 2,000 milliseconds.", 1, 0.024919013207076998, 0.02204099625303064], "isController": false}]}, function(index, item){
        switch(index){
            case 2:
            case 3:
                item = item.toFixed(2) + '%';
                break;
        }
        return item;
    }, [[1, 1]]);

        // Create top5 errors by sampler
    createTable($("#top5ErrorsBySamplerTable"), {"supportsControllersDiscrimination": false, "overall": {"data": ["Total", 4537, 4013, "429/Too Many Requests", 3865, "The operation lasted too long: It took 5,681 milliseconds, but should not have lasted longer than 2,000 milliseconds.", 2, "The operation lasted too long: It took 5,221 milliseconds, but should not have lasted longer than 2,000 milliseconds.", 2, "The operation lasted too long: It took 57,318 milliseconds, but should not have lasted longer than 2,000 milliseconds.", 1, "The operation lasted too long: It took 7,316 milliseconds, but should not have lasted longer than 2,000 milliseconds.", 1], "isController": false}, "titles": ["Sample", "#Samples", "#Errors", "Error", "#Errors", "Error", "#Errors", "Error", "#Errors", "Error", "#Errors", "Error", "#Errors"], "items": [{"data": ["Get All To-dos", 976, 848, "429/Too Many Requests", 843, "The operation lasted too long: It took 51,295 milliseconds, but should not have lasted longer than 2,000 milliseconds.", 1, "The operation lasted too long: It took 20,872 milliseconds, but should not have lasted longer than 2,000 milliseconds.", 1, "The operation lasted too long: It took 61,693 milliseconds, but should not have lasted longer than 2,000 milliseconds.", 1, "The operation lasted too long: It took 60,399 milliseconds, but should not have lasted longer than 2,000 milliseconds.", 1], "isController": false}, {"data": ["Get All Users", 1414, 1304, "429/Too Many Requests", 1178, "The operation lasted too long: It took 5,681 milliseconds, but should not have lasted longer than 2,000 milliseconds.", 2, "The operation lasted too long: It took 5,221 milliseconds, but should not have lasted longer than 2,000 milliseconds.", 2, "The operation lasted too long: It took 7,316 milliseconds, but should not have lasted longer than 2,000 milliseconds.", 1, "The operation lasted too long: It took 7,309 milliseconds, but should not have lasted longer than 2,000 milliseconds.", 1], "isController": false}, {"data": ["Get All Posts", 1122, 976, "429/Too Many Requests", 965, "The operation lasted too long: It took 57,318 milliseconds, but should not have lasted longer than 2,000 milliseconds.", 1, "The operation lasted too long: It took 54,723 milliseconds, but should not have lasted longer than 2,000 milliseconds.", 1, "The operation lasted too long: It took 48,551 milliseconds, but should not have lasted longer than 2,000 milliseconds.", 1, "The operation lasted too long: It took 39,350 milliseconds, but should not have lasted longer than 2,000 milliseconds.", 1], "isController": false}, {"data": ["Get All Comments", 1025, 885, "429/Too Many Requests", 879, "The operation lasted too long: It took 27,628 milliseconds, but should not have lasted longer than 2,000 milliseconds.", 1, "The operation lasted too long: It took 15,004 milliseconds, but should not have lasted longer than 2,000 milliseconds.", 1, "The operation lasted too long: It took 28,624 milliseconds, but should not have lasted longer than 2,000 milliseconds.", 1, "The operation lasted too long: It took 15,024 milliseconds, but should not have lasted longer than 2,000 milliseconds.", 1], "isController": false}]}, function(index, item){
        return item;
    }, [[0, 0]], 0);

});

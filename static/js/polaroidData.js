$(window).on('load', function () {

    var xmlhttp = new XMLHttpRequest();
    xmlhttp.onreadystatechange = function () {
        if (this.readyState == 4 && this.status == 200) {
            var myObj = JSON.parse(this.responseText);

            var picture_info = myObj["polaroid_db"];
            var total = picture_info.length;

            var uniqueTypes = [];
            var uniqueTypesCounts = [];
            var uniquePlaces = [];
            var uniquePlacesCounts = [];
            var uniqueDates = [];
            var uniqueDatesCounts = [];

            function getUniques(e, output) {
                for (i = 0; i < picture_info.length; i++) {
                    var v = picture_info[i][e];
                    if (e == "date") {
                        v = v.substring(0, 4);
                    }
                    if (output.indexOf(v) === -1) {
                        output.push(v);
                    }
                }
                //$("#displayinfo").append(output);
                return output;
            }

            function getCounts(e, uniqX, output) {
                // GET COUNTS OF EACH UNIQUE value FROM THE ORIGINAL ARRAY AND ADD TO UNIQUE COUNTS ARRAY
                $.each(uniqX, function (i, val) {
                    var ThisCt = 0; // RESET THE COUNT
                    $.each(picture_info, function (i2, val2) {
                        v = val2[e];
                        if (e == "date") {
                            v = v.substring(0, 4);
                        }
                        if (val === v) {
                            ThisCt++ // ADD ONE 
                        };
                    });
                    var percentageVal = Math.round((ThisCt / total) * 100, 2);
                    output.push({
                        name: val,
                        percent: percentageVal
                    }); // WHEN DONE ADD THIS COUNT TO THE ARRAY
                });
                //$("#displayinfo").append(output);
                return output;
            };

            var uniXTypes = getUniques("type", uniqueTypes);
            var uniXPlaces = getUniques("place", uniquePlaces);
            var uniXDates = getUniques("date", uniqueDates);

            var typeCount = getCounts("type", uniXTypes, uniqueTypesCounts);
            var placeCount = getCounts("place", uniXPlaces, uniquePlacesCounts);
            var dateCount = getCounts("date", uniXDates, uniqueDatesCounts);

            var pie = d3.layout.pie()
                .value(function (d) {
                    return d.percent
                })
                .sort(null)
                .padAngle(.02);

            var w = 150,
                h = 150;

            var outerRadius = w / 2;
            var innerRadius = 60;

            var color = d3.scale.category10();

            var arc = d3.svg.arc()
                .outerRadius(outerRadius)
                .innerRadius(innerRadius);

            var svg = d3.select("#chart")
                .append("svg")
                .attr({
                    width: w,
                    height: h,
                    //class: 'shadow'
                }).append('g')
                .attr({
                    transform: 'translate(' + w / 2 + ',' + h / 2 + ')'
                });
            var path = svg.selectAll('path')
                .data(pie(placeCount))
                .enter()
                .append('path')
                .attr({
                    d: arc,
                    fill: function (d, i) {
                        return color(d.data.name);
                    }
                });

            $("#displayinfo").append(typeCount, placeCount, dateCount);

        }
    };
    xmlhttp.open("GET", "./static/json/polaroids_db.json", true);
    xmlhttp.send();



    var x = $("#gallery img").length;





});

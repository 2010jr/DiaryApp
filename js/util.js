var d3 = require('d3');
var d3Util = function() {
		return {
				day : d3.time.format("%w"), // day of the week
				day_of_month : d3.time.format("%e"), // day of the month
				day_of_year : d3.time.format("%j"),
				week : d3.time.format("%U"), // week number of the year
				weekName: d3.time.format("%a"),
				month : d3.time.format("%m"), // month number
				year : d3.time.format("%Y"),
				date_format : d3.time.format("%Y-%m-%d"),
				month_format: d3.time.format("%Y-%m"),
				nextMonthFirstDate: function(date) { return new Date(d3Util.year(date), parseInt(d3Util.month(date)) - 1, 1)},
				thisMonthFirstDate: function(date) { return new Date(d3Util.year(date), parseInt(d3Util.month(date)) - 1 + 1, 1)},
				buildCalendarSvg: function(selector, sDate, eDate, cellsize) {
						var width = cellsize * 7; 
						var height = cellsize * (6 + 1); //including month title
						var svg = d3.select(selector).selectAll("svg")
								.data(d3.time.months(d3Util.date_format.parse(sDate), d3Util.date_format.parse(eDate)))
								.enter().append("svg")
								.attr("width", width)
								.attr("height", height)
								.attr("class", "RdYlGn")
								.append("g");
						return svg;
				},

				buildDayGroup: function (svg) {
						var dayGroup = svg.selectAll("g")
								.data(function(d) { 
										var next_month = parseInt(d3Util.month(d)) + 1;
										var next_year = next_month > 12 ? parseInt(d3Util.year(d)) + 1 : parseInt(d3Util.year(d));
										next_month = next_month % 13;
										return d3.time.days(d, new Date(next_year, next_month -1, 1));
								})
						.enter().append("g");
						return dayGroup;
				},

				buildWeekTitle : function(svg,cellsize) {
						var weekTitle = svg.selectAll("text")
										   .data(["Sun","Mon","Tue","Wed","Thu","Fri","Sat"])
										   .enter()
										   .append("text")
										   .attr("x", function(d,ind) { 
										    	   return cellsize * ind;
										   })
										   .attr("y", cellsize / 2)
										   .text(function(d) {
										    	   return d; 
										   });
						return weekTitle;
				},
				
				buildRect: function(dayGroup, cellsize) {
						var rect = dayGroup 
								.append("rect")
								.attr("class", "day")
								.attr("width", cellsize)
								.attr("height", cellsize)
								.attr("x", function(d) {
										return parseInt(d3Util.day(d)) * cellsize; 
								})
						.attr("y", function(d) { 
								var year = parseInt(d3Util.year(d)),
								month = parseInt(d3Util.month(d));
								var week_diff = parseInt(d3Util.week(d)) - parseInt(d3Util.week(new Date(year,month-1,1)));
								return cellsize + (week_diff*cellsize); 
						})
						.datum(d3Util.date_format);
						return rect;
				},
				
				buildDayText: function(dayGroup, cellsize) {
						var daytext = dayGroup 
								.append("text")
								.attr("x", function(d) {
										return parseInt(d3Util.day(d)) * cellsize + cellsize * 0.3;
								})
								.attr("y", function(d) { 
										var year = parseInt(d3Util.year(d)),
										month = parseInt(d3Util.month(d));
										var week_diff = parseInt(d3Util.week(d)) - parseInt(d3Util.week(new Date(year,month-1,1)));
										return cellsize + week_diff * cellsize + cellsize * 0.6; 
								})
								.attr("class", "day-title")
								.text( function(d) { return d3Util.day_of_month(d)});
						return daytext;
				},
				
				buildMonthTitle: function(svg, cellsize) {
						var month_titles = svg  // Jan, Feb, Mar and the whatnot
								.append("text")
								.attr("width",cellsize)
								.attr("height", cellsize)
								.attr("x", 0) 
								.attr("y", cellsize * 0.5)
								.attr("class", "month-title")
								.text(function(d) { return d3Util.year(d) + "/" + d3Util.month(d)});
						return month_titles;
				},

				buildToolTip: function(svgObject,tooltipType, callbackFunc) {
						svgObject.on(tooltipType, callbackFunc);
						return svgObject;
				}
		}
}();

module.exports = d3Util;

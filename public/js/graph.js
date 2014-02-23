'use strict';

g.plotGraph = function(dataFilePath) {

	var margin = {top: 20, right: 20, bottom: 30, left: 50},
	    width = $('#wrapper').width() - margin.left - margin.right,
	    height = $('#wrapper').width()*0.5 - margin.top - margin.bottom;

	var parseDate = d3.time.format("%d-%b-%y").parse;

	var x = d3.time.scale()
	    .range([0, width]);

	var y = d3.scale.linear()
	    .range([height, 0]);

	var xAxis = d3.svg.axis()
	    .scale(x)
	    .orient("bottom");

	var yAxis = d3.svg.axis()
	    .scale(y)
	    .orient("left");

	var line = d3.svg.line()
	    .x(function(d) { return x(d.date); })
	    .y(function(d) { return y(d.tps); });

	var svg = d3.select("div.graph").append("svg")
	    .attr("width", width + margin.left + margin.right)
	    .attr("height", height + margin.top + margin.bottom)
	  .append("g")
	    .attr("transform", "translate(" + margin.left + "," + margin.top + ")");

	d3.tsv(dataFilePath, function(error, data) {
	  data.forEach(function(d) {
	    d.date = new Date(parseInt(d.date));
	    d.tps = +d.tps;
	  });

	// d3.tsv.parse(TSVdata, function(error, data) {
	// 	console.log(error)
	//   data.forEach(function(d) {
	//     d.date = new Date(parseInt(d.date));
	//     d.tps = +d.tps;
	//   });

	  x.domain(d3.extent(data, function(d) { return d.date; }));
	  y.domain(d3.extent(data, function(d) { return d.tps; }));

	  svg.append("g")
	      .attr("class", "x axis")
	      .attr("transform", "translate(0," + height + ")")
	      .call(xAxis);

	  svg.append("g")
	      .attr("class", "y axis")
	      .call(yAxis)
	    .append("text")
	      .attr("transform", "rotate(-90)")
	      .attr("y", 6)
	      .attr("dy", ".71em")
	      .style("text-anchor", "end")
	      .text("Tweets per second");

	  svg.append("path")
	      .datum(data)
	      .attr("class", "line")
	      .attr("d", line);
	});

	/*
	* BRUSH TOOLS
	*/

	var brushHeight = 40;

	var arc = d3.svg.arc()
	    .outerRadius(brushHeight / 2)
	    .startAngle(0)
	    .endAngle(function(d, i) { return i ? -Math.PI : Math.PI; });

	var brush = d3.svg.brush()
	    .x(x)
	    .extent([.3, .5])
	    .on("brushstart", brushstart)
	    .on("brush", brushmove)
	    .on("brushend", brushend);

	var brushg = svg.append("g")
	    .attr("class", "brush")
	    .call(brush);

	brushg.selectAll(".resize").append("path")
	    .attr("transform", "translate(" + 0 + "," +  height / 2 + ")")
	    .attr("d", arc);

	brushg.selectAll("rect")
	    .attr("height", height);

	brushstart();

	function brushstart() {
	  svg.classed("selecting", true);
	}

	function brushmove() {
	  g.dateRange = brush.extent();
	  console.log(g.dateRange);
	}

	function brushend() {
	  svg.classed("selecting", !d3.event.target.empty());
	}
};
function lineChart()
{
	// Default config
	var width = 600,
		height = 200, 
		data_set_a = [],
		data_set_b = [],
		yAxisLabelLeft = "Set A",
		yAxisLabelRight = "Set B";


	function my(container) {

		setDimensions();

		setupXAxis();
		setupYAxisLeft();
		setupYAxisRight();
		setupBarChartLayout();

		addXAxisLabel();
		addYAxisLeftLabel();
		addYAxisRightLabel();
		addLineChartData();
		addSpikeChartData();

		applyStyle();

		var axisLabelMargin, margin;

		function setDimensions() 
		{
			axisLabelMargin = 10;
			margin = {
				top: 20,
				right: 50,
				bottom: 40,
				left: 30
			};
		}

		var xScale, xAxis ;

		function setupXAxis() 
		{
			xScale = d3.time.scale()
				.range([axisLabelMargin, width - margin.left - margin.right])
				.domain(d3.extent(data_set_a.concat(data_set_b), function(d) { return d.date; }));

			xAxis = d3.svg.axis()
				.scale(xScale)
				.ticks(d3.time.hour, 1)
				.tickFormat(d3.time.format('%_I %p'))
				.orient('bottom')
		}

		var yScaleLeft, yAxisLeft;

		function setupYAxisLeft() 
		{
			yScaleLeft = d3.scale.linear()
				.domain([0, d3.max(data_set_a, function(d) { return d.value })])
				.range([height - axisLabelMargin - margin.top - margin.bottom, 0]);

			yAxisLeft = d3.svg.axis()
				.scale(yScaleLeft)
				.tickFormat(d3.format("d"))
				.orient('left');
		}

		var yScaleRight, yAxisRight;

		function setupYAxisRight() 
		{
			yScaleRight = d3.scale.linear()
				.domain([0, d3.max(data_set_b, function(d) { return d.value })])
				.range([height - margin.top - axisLabelMargin - margin.bottom, 0]);

			yAxisRight = d3.svg.axis()
				.scale(yScaleRight)
				.tickFormat(d3.format("d"))
				.orient('right');
		}

		var g;

		function setupBarChartLayout() 
		{
			container.select("svg").remove();

			g = container.append('svg')
				.attr('class', 'svg-chart')
				.attr('width', width)
				.attr('height', height)
				.append('g')
				.attr('transform', 'translate(' + margin.left + ',' + margin.top + ')');
		}

		function addXAxisLabel() 
		{
			g.append('g')
				.attr('class', 'x axis ')
				.attr('transform', 'translate(0,' + (height - axisLabelMargin - margin.top - margin.bottom) + ')')
				.call(xAxis)
				.selectAll("text")  
				.style("text-anchor", "end")
				.attr("dx", "-.8em")
				.attr("dy", ".15em")
				.attr("transform", function(d) {
					return "rotate(-65)" 
				});
		}

		function addYAxisLeftLabel() 
		{
			g.append('g')
				.attr('class', 'y axis left')
				.attr('transform', 'translate(' + axisLabelMargin + ', 0)')
				.call(yAxisLeft)
				.append('text')
				.attr('class', 'axis-label')
				.attr('transform', 'rotate(-90)')
				.attr('y', -margin.left)
				.attr('x', -(height - margin.top - margin.bottom - axisLabelMargin) / 2)
				.style('text-anchor', 'middle')
				.text(yAxisLabelLeft);
		}

		function addYAxisRightLabel() 
		{
			g.append('g')
				.attr('class', 'y axis right')
				.attr('transform', 'translate(' + (width - margin.right -  margin.left )+ ', 0)')
				.call(yAxisRight)
				.append('text')
				.attr('class', 'axis-label')
				.attr('transform', 'rotate(-90)')
				.attr('y', margin.right)
				.attr('x', -(height - margin.top - margin.bottom - axisLabelMargin) / 2)
				.style('text-anchor', 'middle')
				.text(yAxisLabelRight);
		}

		function addLineChartData() 
		{
			var line = d3.svg.line()
				.x(function(d) { return xScale(d.date); })
				.y(function(d) { return yScaleLeft(d.value); });

			g.append("path")
				.datum(data_set_a)
				.attr("class", "line")
				.attr("d", line);
		}

		function addSpikeChartData() 
		{

			bar = g.selectAll('.point')
				.data(data_set_b)
				.enter().append('circle')
				.attr('class', 'point')
				.attr('cx', function(d) { return xScale(d.date) })
				.attr('r', 1.2)
				.attr('cy', function(d) { return yScaleRight(d.value) });
		}

		function applyStyle ()
		{
			g.selectAll('.axis line, path').style({
				'stroke': 'Black',
				'fill': 'none',
				'stroke-width': '1px',
				'shape-rendering':'crispEdges'
			});

			g.selectAll('.y.axis.left').style({
				'fill': 'steelblue'
			});

			g.selectAll('.y.axis.right').style({
				'fill': 'brown'
			});

			g.selectAll('.x.axis text').style({
				'font-family': 'sans-serif',
				'font-size': '12px'
			});

			g.selectAll('.line').style({
				'stroke': 'steelblue',
				'stroke-width': '1.5px'
			});
			
			g.selectAll('.point').style({
				'stroke': 'brown',
				'fill': 'brown',
				'stroke-width': '1px'
			});
		}
	}

	my.width = function(value) {
		if (!arguments.length) return width;
		width = value;
		return my;
	};

	my.height = function(value) {
		if (!arguments.length) return height;
		height = value;
		return my;
	};

	my.data_set_a = function(value) {
		if (!arguments.length) return data_set_a;
		data_set_a = value;
		return my;
	};

	my.data_set_b = function(value) {
		if (!arguments.length) return data_set_b;
		data_set_b = value;
		return my;
	};

	my.yAxisLabelLeft = function(value) {
		if (!arguments.length) return yAxisLabelLeft;
		yAxisLabelLeft = value;
		return my;
	};

	my.yAxisLabelRight = function(value) {
		if (!arguments.length) return yAxisLabelRight;
		yAxisLabelRight = value;
		return my;
	};

	return my;
}

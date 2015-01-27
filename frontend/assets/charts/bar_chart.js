function barChart()
{
	// Default config
	var width = 600,
		height = 200, 
		data = [],
		heightBar = 25,
		scrollBar =30;

	function my(container) {

		setDimensions();
		setupAxis();

		addSvgChart();
		addBarChartData();
		addImages();
		addAxes();

		applyStyle();

		var margin;

		function setDimensions()
		{
			margin = {top: 30, right: 0, bottom: 10, left: heightBar};

			heightChart = data.length * heightBar - margin.top - margin.bottom;
		}


		var xAxis, xScale, yScale, minLoss, maxGain;

		function setupAxis()
		{

			minLoss = d3.min(data, function(d) { return d.count_loss});
			maxGain = d3.max(data, function(d) { return d.count_gain});
			var domain = Math.max(Math.abs(minLoss),maxGain);

			xScale = d3.scale.linear()
				.range([0, width-scrollBar])
				.domain([0-domain,domain]);

			yScale = d3.scale.ordinal()
				.rangeRoundBands([0, heightChart], .1)
				.domain(data.map(function(d) { return d.id; }));

			xAxis = d3.svg.axis()
				.scale(xScale)
				.orient("top");
		}

		var svg,tip_gain,tip_loss;

		function addSvgChart()
		{
			container.select("svg").remove();

			svg = container.append("svg")
				.attr("width", width + margin.left + margin.right - 40)
				.attr("height", heightChart + margin.top + margin.bottom)
				.append("g")
				.attr("transform", "translate(" + margin.left + "," + margin.top + ")");

			container.style({
				"height":height+"px",
				"overflow-y":"auto",
				"overflow-x":"hidden"
			});
			
			tip_loss = d3.tip()
				.attr('class', 'd3-tip')
				.offset([-10, 0])
				.html(function(d) {
					var html = '';
					html += d.name;
					html +=  " : <span style='color:red'>" + d.count_loss + "</span>";
					return html;
				});

			tip_gain = d3.tip()
				.attr('class', 'd3-tip')
				.offset([-10, 0])
				.html(function(d) {
					var html = '';
					html += d.name;
					html +=  " : <span style='color:lawngreen'>+ " + d.count_gain + "</span>";
					return html;
				});

			svg.call(tip_loss);
			svg.call(tip_gain);
		}

		function addBarChartData() 
		{
			if (data.length == 0)
				return;

			// Create negative rects
			svg.selectAll(".bar")
				.data(data)
				.enter().append("rect")
				.attr("x", function(d) { return xScale(d.count_loss); })
				.attr("y", function(d) { return yScale(d.id); })
				.attr("width", function(d) { return Math.abs(xScale(d.count_loss) - xScale(0)); })
				.attr("height", yScale.rangeBand())
				.style("fill","steelblue")
				.on("mouseover", tip_loss.show)
				.on("mouseout", tip_loss.hide);
			
			// Create positive rects
			svg.selectAll(".bar")
				.data(data)
				.enter().append("rect")
				.attr("x", function(d) { return xScale(0); })
				.attr("y", function(d) { return yScale(d.id); })
				.attr("width", function(d) { return xScale(d.count_gain) - xScale(0) })
				.attr("height", yScale.rangeBand())
				.style("fill","seagreen")
				.on("mouseover", tip_gain.show)
				.on("mouseout", tip_gain.hide);
		}

		function addImages()
		{
			var paddingImg = 2;

			// Images on negative side
			svg.selectAll(".image_loss")
				.data(data.filter(function(d) { return d.count_loss < 0; }))
				.enter().append("svg:image")
				.attr("x", function(d){ return xScale(d.count_loss) - heightBar - paddingImg;})
				.attr("y", function(d) { return yScale(d.id); })
				.attr("width", heightBar - paddingImg)
				.attr("height", heightBar - paddingImg)
				.attr("xlink:href", function (d) { return d.img })
				.on("mouseover", tip_loss.show)
				.on("mouseout", tip_loss.hide);

			// Images on positive
			svg.selectAll(".image_gain")
				.data(data.filter(function(d) { return d.count_gain > 0; }))
				.enter().append("svg:image")
				.attr("x", function(d) { return xScale(d.count_gain) + paddingImg;})
				.attr("y", function(d) { return yScale(d.id); })
				.attr("width", heightBar - paddingImg)
				.attr("height", heightBar - paddingImg)
				.attr("xlink:href", function (d) { return d.img })
				.on("mouseover", tip_gain.show)
				.on("mouseout", tip_gain.hide);

		}

		function addAxes() 
		{
			if (data.length == 0)
				return;

			svg.append("g")
				.attr("class", "x axis")
				.call(xAxis);

			svg.append("g")
				.attr("class", "y axis")
				.append("line")
				.attr("x1", xScale(0))
				.attr("x2", xScale(0))
				.attr("y2", heightChart);
		}

		function applyStyle ()
		{
			svg.selectAll('.axis line, path').style({
				'stroke': 'Black',
				'fill': 'none',
				'stroke-width': '1px',
				'shape-rendering':'crispEdges'
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

	my.data = function(value) {
		if (!arguments.length) return data;
		data = value;
		return my;
	};

	return my;
}

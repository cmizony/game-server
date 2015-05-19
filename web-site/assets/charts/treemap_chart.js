function treemapChart()
{
	// Default config
	var data = [],
		width = 400,
		height = 400;


	function my(container) {

		var w,h,xScale,yScale,color,root,node,treemap,svg,tip;

		setConfig();
		addTreeMap ();
		addCells ();
		applyStyle();

		function setConfig() 
		{
			w = width;
			h = height;
			xScale = d3.scale.linear().range([0, w]);
			yScale = d3.scale.linear().range([0, h]);
			color = d3.scale.category10();
			node = root = data;
		}

		function addTreeMap()
		{

			treemap = d3.layout.treemap()
				.round(false)
				.size([w, h])
				.sticky(true)
				.value(function(d) { return d.count; });

			container.select("div").remove();

			svg = container.append("div")
				.attr("class", "chart")
				.style("width", w + "px")
				.style("height", h + "px")
				.append("svg:svg")
				.attr("width", w)
				.attr("height", h)
				.append("svg:g")
				.attr("transform", "translate(.5,.5)");

			tip = d3.tip()
				.attr('class', 'd3-tip')
				.offset([-10, 0])
				.html(function(d) {
					var html = '';
					html += '<span style="color:'+color(d.parent.name)+'">'
					html += d.parent.name+"</span> ";
					html += d.name+" : <span style='color:red'>" + d.count + "</span>";
					return html;
				});

			svg.call(tip);
		}


		function addCells ()
		{

			var nodes = treemap.nodes(root)
				.filter(function(d) { return !d.children; });

			var cell = svg.selectAll("g")
				.data(nodes)
				.enter().append("svg:g")
				.attr("class", "cell")
				.attr("transform", function(d) { return "translate(" + d.x + "," + d.y + ")"; })
				.on("click", function(d) { return zoom(node == d.parent ? root : d.parent); });

			cell.append("svg:rect")
				.attr("width", function(d) { return Math.max(d.dx - 1,0); })
				.attr("height", function(d) { return Math.max(d.dy - 1,0); })
				.style("fill", function(d) { 
					if (!d.parent)
						return "#f5f5f5";
					return color(d.parent.name); 
				})
			.on("mouseover", function(d) {
				if (!d.children)
				{
					$(this).css({'opacity':0.8});
					tip.show(d);
				}
			})                  
			.on("mouseout", function(d) {       
				if (!d.children)
				{
					$(this).css({'opacity':1});
					tip.hide(d);
				}
			 });

			cell.append("svg:text")
				.attr("x", function(d) { return d.dx / 2; })
				.attr("y", function(d) { return d.dy / 2; })
				.attr("dy", ".35em")
				.attr("text-anchor", "middle")
				.text(function(d) { return d.name; })
				.style("opacity", function(d) { d.w = this.getComputedTextLength(); return d.dx > d.w ? 1:0; })
				.on("mouseover", function(d) {
					if (!d.children)
					tip.show(d);
				})
				.on("mouseout", function(d) {       
					if (!d.children)
					tip.hide(d);
				});

			d3.select(window).on("click", function() { zoom(root); });

		}

		function applyStyle()
		{
			svg.selectAll('text').style({
				'font-size' : '11px',
			'cursor' : 'pointer'
			});

			svg.selectAll('rect').style({'cursor' : 'pointer'});
		}

		function zoom(d) 
		{
			var kx = w / d.dx, ky = h / d.dy;
			xScale.domain([d.x, d.x + d.dx]);
			yScale.domain([d.y, d.y + d.dy]);

			var t = svg.selectAll("g.cell").transition()
				.duration(d3.event.altKey ? 7500 : 750)
				.attr("transform", function(d) { return "translate(" + xScale(d.x) + "," + yScale(d.y) + ")"; });

			t.select("rect")
				.attr("width", function(d) { return Math.max(kx * d.dx - 1,0); })
				.attr("height", function(d) { return Math.max(ky * d.dy - 1,0); })

				t.select("text")
				.attr("x", function(d) { return kx * d.dx / 2; })
				.attr("y", function(d) { return ky * d.dy / 2; })
				.style("opacity", function(d) { return kx * d.dx > d.w ? 1 : 0; });

			node = d;
			d3.event.stopPropagation();
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



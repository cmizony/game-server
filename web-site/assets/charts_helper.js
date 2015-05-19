
/***************************
 * 
 * Helper TreeMap Chart
 *
 **************************/
function getTreeMapChart (params)
{
	var tz_server = params.tz_server;
	var tz_local = new Date().getTimezoneOffset();
	var tz_offset = tz_local*60 - tz_server;

	var detailedActions = [];

	// Pre process logs
	for (var i=0 ; i < params.data.length ; i++)
	{
		var log = params.data[i];
		var actions = JSON.parse(log.actions);

		// Test matrix filter
		var filterName = true;
		var filterDate = true;
		for (var j=0 ; j < params.filters.length ; j++)
		{
			var filter = params.filters[j];
			var log_date = new Date((parseInt(log.date) + tz_offset) * 1000);

			if (filter.name == log.name)
				filterName = false;
			
			if (filter.value == log_date.getHours())
				filterDate = false;
		}

		if (filterName || filterDate)
			continue;

		// Get values
		if (typeof actions === 'object')
		{
			for (var property in actions)
			{
				var key = property.split(" ");
				var category = key[0];
				var name = key[1];

				if (detailedActions[category] == undefined)
					detailedActions[category] = {};

				var rootCategory = detailedActions[category];

				if (rootCategory[name] == undefined)
					rootCategory[name] = 0;
				
				rootCategory[name] += actions[property];
			}
		}
	}

	// Create Tree
	var rootChildren = [];

	for (var category in detailedActions)
	{
		var categoryActions = detailedActions[category];
		var categoryChildren = [];
		
		for (var name in categoryActions)
		{
			categoryChildren.push({
				name : name,
				count : categoryActions[name]
			});
		}

		rootChildren.push({
			name : category,
			children : categoryChildren
		});
	}

	// Chart config
	var data = { name: "Actions", children : rootChildren };
	var width = $(params.containerId).width();
	var height = 400;

	// Create chart
	var chart = treemapChart()
		.data(data)
		.width(width)
		.height(height);

	d3.select(params.containerId).call(chart);
}

/***************************
 * 
 * Helper TreeMap Chart
 *
 **************************/
function getBarChart (params)
{
	var tz_server = params.tz_server;
	var tz_local = new Date().getTimezoneOffset();
	var tz_offset = tz_local*60 - tz_server;

	var inventories = [];

	// Identify items with multiple meta (Damage)
	var multipleMeta = [];
	var all_items = get_all_items();

	for (var i = 0 ; i < all_items.length ; i ++)
		if (all_items[i].meta != 0)
			multipleMeta.push(all_items[i].text_type);

	multipleMeta = multipleMeta.filter(function(elem, pos) {
		return multipleMeta.indexOf(elem) == pos;
	}); 

	// Pre process logs 
	for (var i=0 ; i < params.data.length ; i++)
	{
		var log = params.data[i];
		var inventory = JSON.parse(log.inventory);

		// Test inventory filter
		var filterName = true;
		var filterDate = true;
		for (var j=0 ; j < params.filters.length ; j++)
		{
			var filter = params.filters[j];
			var log_date = new Date((parseInt(log.date) + tz_offset) * 1000);

			if (filter.name == log.name)
				filterName = false;
			
			if (filter.value == log_date.getHours())
				filterDate = false;
		}

		if (filterName || filterDate)
			continue;
		
		// Group by id
		if (typeof inventory === 'object')
		{
			for (var key in inventory)
			{
				var split_key = key.split(" ");
				var name = split_key[0];
				var meta = split_key[1];
				var id = name+" 0";

				// Filter Meta (fast)
				if (multipleMeta.indexOf(name) != -1)
					id = key;

				if (inventories[id] == undefined)
					inventories[id] = { gain:0, loss:0 };
				
				if (inventory[key] > 0)
					inventories[id].gain += inventory[key];
				else
					inventories[id].loss += inventory[key];
			}
		}
	}


	// Re-index data and add information
	var data = [];

	for (var key in inventories)
	{
		var split_key = key.split(" ");
		var name = split_key[0];
		var meta = split_key[1];
		var type = 0;

		// Find type id for image
		for (var i = 0 ; i < all_items.length ; i ++)
		{
			if (all_items[i].meta == meta &&
				all_items[i].text_type == name)
			{
				type = all_items[i].type;
				break;
			}
		}

		var img = 'images/items/'+type+"-"+meta+".png";

		data.push({
			id: name+" "+meta,
			name: name,
			img: img,
			count_gain: inventories[key].gain,
			count_loss: inventories[key].loss,
		});
	}

	// Sort array Desc
	data = data.sort ( function (a, b){ return (Math.abs(b.count_loss)+b.count_gain) - (Math.abs(a.count_loss)+ a.count_gain); });

	// Chart config
	var width = $(params.containerId).width();
	var height = 400;

	// Create chart
	var chart = barChart()
		.data(data)
		.width(width)
		.height(height);

	d3.select(params.containerId).call(chart);
}


/***************************
 * 
 * Helper Line Chart
 *
 **************************/
function getLineChart (params)
{
	var tz_server = params.tz_server;
	var tz_local = new Date().getTimezoneOffset();
	var tz_offset = tz_local*60 - tz_server;

	// pre process data players
	var processed_data_logs = [];
	var cursor_time;
	var current_obj = null;

	// Group by date
	for (var i=0 ; i < params.data_logs.length ; i++)
	{
		var log = params.data_logs[i];

		if (cursor_time != log.date)
		{
			if (current_obj != null)
			{
				// Always add current object
				processed_data_logs.push(current_obj);

				// In case of gab Add 0 players record
				if (Math.abs(log.date - cursor_time) > 900)
				{
					processed_data_logs.push({
						value : 0,
						date : new Date(current_obj.date.getTime() + 60000)
					});

					processed_data_logs.push({
						value : 0,
						date : new Date((log.date-60+tz_offset)*1000)
					});
				}
			}

			// Update current object
			current_obj = {
				value : 0,
				date : new Date((parseInt(log.date) + tz_offset) * 1000)
			};

			cursor_time = log.date;
		}

		current_obj.value += 1;
	}

	// Optmize size of processed data logs
	var compressed_data_logs = [];

	// First entry 
	if (processed_data_logs.length > 0)
		compressed_data_logs.push(processed_data_logs[0]);

	// Middle entries
	for (var i=0 ; i < processed_data_logs.length-1 ; i ++)
	{
		var log = processed_data_logs[i];
		var next_log = processed_data_logs[i+1];

		if (log.value != next_log.value)
		{
			compressed_data_logs.push(log);
			compressed_data_logs.push(next_log);
		}
	}


	// pre process data lags
	var processed_data_lags = [];

	for (var i=0 ; i < params.data_lags.length ; i++)
	{
		var lag = params.data_lags[i];
		var next_lag = params.data_lags[i+1];

		// Only when more than one lag every 30 sec
		if (next_lag &&
			Math.abs(lag.date - next_lag.date) < 30)
		{

			processed_data_lags.push({
				date : new Date((parseInt(lag.date) + tz_offset) * 1000),
				value: parseInt(lag.ticks)
			});
		}
	}

	// Chart config
	var height = 250;
	var width = $(params.containerId).width();

	// Create chart
	var chart = lineChart()
		.data_set_a(compressed_data_logs)
		.data_set_b(processed_data_lags)
		.width(width)
		.height(height)
		.yAxisLabelLeft("Online Players")
		.yAxisLabelRight("Lag (ticks)");

	d3.select(params.containerId).call(chart);
}


/***************************
 * 
 * Helper Matrix Chart
 *
 **************************/
function getMatrixChart(params)
{
	var tz_server = params.tz_server;
	var tz_local = new Date().getTimezoneOffset();
	var tz_offset = tz_local*60 - tz_server;

	// pre process data players
	var data_players = [];

	// Group by players & hours
	for (var i=0 ; i < params.data.length ; i++)
	{
		var log = params.data[i];

		if (data_players[log.name] == undefined)
			data_players[log.name] = [];
		
		var log_date = new Date((parseInt(log.date) + tz_offset) * 1000);
		var hour = log_date.getHours();

		data_players[log.name][hour] = 1;
	}
	
	var matrix = matrixChart()
		.data(data_players)
		.callbackUpdate(params.callbackUpdate);

	matrix(params.containerId);
}


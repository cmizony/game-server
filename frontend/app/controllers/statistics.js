
app.controller('StatisticsController', function ($scope) {

	// Var Declaration
	var loaded_day= new Date (0);
	var OFFSET_SERVER = 5*3600;
	init_statistics();

	function init_statistics(data)
	{
		// Create Date Picker
		$("#calendar-picker").datepicker({ todayBtn: "linked"});

		// Handle event change date
		$('#calendar-picker').datepicker().on('changeDate',update_calendar);
		
		// Set as today date (for server)
		var tz_local = new Date().getTimezoneOffset();
		var tz_offset = tz_local*60 - OFFSET_SERVER;

		var today = new Date(Date.now() + tz_offset * 1000);
		$('#calendar-picker').datepicker('setDate',new Date(today.getFullYear(),today.getMonth(),today.getDate()));

		// Init description
		$("#pointer-explanation").popover({
			content:"You got it!",
			placement:"top"
		});
	}

	function update_calendar (e)
	{
		if (e.date.getTime() != loaded_day.getTime())
		{
			var param = e.date.getFullYear() + "-" + (e.date.getMonth()+1) + "-" + e.date.getDate();
			$.get(BASE_URL+"/advance_search/"+param, renderAllCharts);
		}

		loaded_day = e.date;
	}

	function renderAllCharts (data)
	{
		var loaded_lags = data.lags;
		var loaded_logs = data.logs;

		renderMainCharts();

		function renderMainCharts ()
		{
			getLineChart({
				data_logs: loaded_logs,
				data_lags: loaded_lags,
				tz_server : OFFSET_SERVER,
				containerId: "#line-chart"
			});

			getMatrixChart({
				data: loaded_logs,
				tz_server : OFFSET_SERVER,
				callbackUpdate : renderSubCharts,
				containerId: "#matrix-chart"
			});

		}

		function renderSubCharts (filters)
		{
			getBarChart({
				data: loaded_logs,
				filters : filters,
				tz_server : OFFSET_SERVER,
				containerId: "#bar-chart"
			});

			getTreeMapChart({
				data: loaded_logs,
				filters : filters,
				tz_server : OFFSET_SERVER,
				containerId: "#treemap-chart"
			});
		}
	}
});

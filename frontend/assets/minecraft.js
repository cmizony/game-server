
/****************************
 *
 * Controller tab General
 *
 ****************************/

function load_tab_general ()
{
	$('[data-toggle="tooltip"]').tooltip();
	$("#join-submit").click(send_suscription);
	$.get(BASE_URL+"/summary_donations", load_summary_donations);

	// Bind feature to open tabs
	$("#feature-lives").click(function(){ $('a[href="#tab-players"]').tab('show') });
	$("#feature-score").click(function(){ $('a[href="#tab-players"]').tab('show') });
	$("#feature-rewards").click(function(){ $('a[href="#tab-rewards"]').tab('show') });
	$("#feature-structures").click(function(){ $('a[href="#tab-structures"]').tab('show') });
	$("#feature-map").click(function(){ $('a[href="#tab-map"]').tab('show') });

	function load_summary_donations (data)  {
		var content = "";
		
		// Top daily donator
		content = "<code>"+data.top_weekly.username+" $"+data.top_weekly.amount+"</code> ";
		$("#weekly-donator").html(content);
		
		
		// Top daily donator
		content = "<code>"+data.top_daily.username+" $"+data.top_daily.amount+"</code> ";
		$("#daily-donator").html(content);

		// Sum monthly donation
		var serverCost = 12;
		var percentage = parseInt(data.sum_monthly*100/serverCost);

		$("#progress-donation").css("width",Math.min(100,percentage) + "%");
		$("#progress-donation").html(percentage + "%");
		$("#monthly-donation").html("<code>$" +  data.sum_monthly + "</code>");
	}	

	function send_suscription ()
	{
		var inputName = $("#input-name").val();
		var inputEmail = $("#input-email").val();

		// Check valid input
		if (inputName == "" || inputEmail == "")
		{
			new PNotify({
				text: 'Please fill your name & email',
				type: 'error'
			});
		}

		var re = /^(([^<>()[\]\\.,;:\s@\"]+(\.[^<>()[\]\\.,;:\s@\"]+)*)|(\".+\"))@((\[[0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}\])|(([a-zA-Z\-0-9]+\.)+[a-zA-Z]{2,}))$/;
		
		if (!re.test(inputEmail))
		{
			new PNotify({
				text: 'Please enter a valid email',
				type: 'error'
			});
		}

		var post_data = JSON.stringify({name: inputName, email:inputEmail});

		$.post( BASE_URL+"/player", post_data, function (data){
			
			if (data.error){
				new PNotify({
					text: data.error,
					type: 'error'
				});
			}

			if (data.success) {
				new PNotify({
					text: data.success,
					type: 'success'
				});
				new PNotify({
					text: "Welcome to the server. Please check the forum to stay updated.",
					type: 'info'
				});
				
				$('#modal-join-server').modal('hide')
			}

		},"json");
	}
}

/****************************
 *
 * Controller tab Events
 *
 ****************************/

function load_tab_calendar ()
{
	$('#full-calendar').fullCalendar({
		header: {
			left: 'prev,next today',
			center: 'title',
			right: 'month,agendaWeek,agendaDay'
		},
		events: [],
		minTime: '9:00:00',
		allDaySlot: false,
		firstDay: 1,
		defaultView: 'agendaWeek',
	});
}

/****************************
 *
 * Controller tab Rewards
 *
 ****************************/
function load_tab_rewards ()
{
	$("#reward-submit").click(send_reward);

	function send_reward ()
	{
		var inputToken = $("#reward-token").val();

		// Check valid input
		if (inputToken == "")
		{
			new PNotify({
				text: 'Please fill Token value',
				type: 'error'
			});
		}

		var post_data = JSON.stringify({token: inputToken});

		$.post( BASE_URL+"/reward", post_data, function (data){
			if (data.error){
				new PNotify({
					text: data.error,
					type: 'error'
				});
			}

			if (data.success) {
				new PNotify({
					text: data.success,
					type: 'success'
				});
		
				var formatted_items = get_formatted_items(data.items);
				$("#reward-package").empty();
				$("#reward-package").append('<li class="list-group-item list-group-item-success">Content of your package</li>');

				for (var i = 0; i < formatted_items.length; i++)
				{
					var item = formatted_items[i];
					$("#reward-package").append('<li class="list-group-item"><img src="images/items/'+item.img+'"> '+item.name+' x'+item.count+'</li>');
				}
			}
		});
	}
}

/****************************
 *
 * Controller tab Players
 *
 ****************************/
function load_tab_players ()
{
	$.get(BASE_URL+"/players", load_datatable);

	$.get(BASE_URL+"/summary_players", load_summary_players)
	setInterval(function (){
		$.get(BASE_URL+"/summary_players", load_summary_players)
	},60000);


	$('[data-toggle="tooltip"]').tooltip();
	$("#vote-submit").click(send_vote);

	function load_player_details ()
	{
		var uuid = $(this).data("uuid");
		
		$.get(BASE_URL+"/player/"+uuid, function (data) {
			
			$('#modal-view-player').modal('show');

			if (data.last_online == 0)
				data.last_online = "";
			else
				data.last_online = jQuery.timeago(new Date(1000*data.last_online));
			
			data.created = format_timestamp (data.created);

			// summary data
			$('#player-name').html(data.name);
			$('#player-votes').html(data.votes);
			$('#player-lives').html(data.lives);
			$('#vote-uuid').val(uuid);
			$('#player-created').html(data.created);
			$('#player-last-online').html(data.last_online);
			$('#player-score').html(data.score);
	
			if (data.stats)
			{
				var total_deaths = data.stats['stat.deaths'];
				$('#player-total-deaths').html(total_deaths == undefined ? 0 : total_deaths);
				
				var minute_player = data.stats['stat.playOneMinute']/60;
				$('#player-time-played').html(split_time(minute_player));
			}

			// Diplsay enderchest
			if (!data.enderchest_content)
				data.enderchest_content = "[]";
			

			var formatted_items = get_formatted_items(JSON.parse(data.enderchest_content));
			
			for (var i = 0; i < 27; i++)
				$("#enderchest-slot-"+i).html('<img src="images/items/0-0.png">');

			for (var i = 0; i < formatted_items.length; i++)
			{
				var item = formatted_items[i];
				$("#enderchest-slot-"+item.slot).html('<img src="images/items/'+item.img+'"> x'+item.count);
			}
			$("#player-enderchest-count").html(formatted_items.length);
			

			// Load scores
			var raw_achievements = get_achievements();

			var dataSet = [];
			for (var i = 0; i < raw_achievements.length; i++)
			{
				var raw_achievement = raw_achievements[i];
				var max_points = parseInt(raw_achievement.difficulty) * 2;
				var points = data.stats["achievement."+raw_achievement.id];

				if (raw_achievement.id == "exploreAllBiomes")
				{
					max_points = raw_achievement.difficulty;
				}

				points = calculate_score(raw_achievement.difficulty,points);
				var percent_done = parseInt(points*100/max_points);

				points = percent_done+"%";

				if (percent_done == 100)
					points = "<span class=\"achievements-done\">"+points+"</span>";
				else if (percent_done > 0)
					points = "<span class=\"achievements-in-progress\">"+points+"</span>";

				dataSet.push([
					"<img src=\"images/achievements/"+raw_achievement.icon+"\">",
					raw_achievement.achievement,
					"<span class=\"text-muted\">"+raw_achievement.description+"</span>",
					raw_achievement.difficulty,
					points,
					max_points
				]);
			}

			$('#datatable-achievements').dataTable().fnDestroy();

			$('#datatable-achievements').dataTable({
				"pageLength": 6,
				"data": dataSet,
				"order": [[3,"asc" ]],
				"fnDrawCallback": function( oSettings ) {
					$('.achievements-done').each(function () {
						$(this).closest("tr").addClass("success");
					});
					$('.achievements-in-progress').each(function () {
						$(this).closest("tr").addClass("info");
					});
				}
			});

			// Load Rewards
			var count_rewards = data.rewards.length;

			$('#player-rewards-count').html(count_rewards);
			$("#tab-player-rewards").empty();

			for (var i=0 ; i< count_rewards ; i++)
			{
				var reward = data.rewards[i];
				var formatted_items = get_formatted_items(JSON.parse(reward.items));
			
				var list_rewards = $('<ul class="pull-left">');
				list_rewards.append('<li class="list-group-item list-group-item-success" style="padding:5px">'+format_timestamp(reward.created)+'</li>');

				for (var j = 0; j < formatted_items.length; j++)
				{
					var item = formatted_items[j];
					list_rewards.append('<li class="list-group-item" style="padding:5px"><img src="images/items/'+item.img+'"> '+item.name+' x'+item.count+'</li>');
				}

				$("#tab-player-rewards").append(list_rewards);
			}

			// Load player biomes
			var explored_biomes = data.stats["achievement.exploreBiomesProgress"];
			if (explored_biomes != undefined)
			{
				$("#player-biomes-count").html(explored_biomes.length);
				$("#tab-player-biomes-content").html(create_dom_biomes(explored_biomes));
			}

		});
	}

	function send_vote ()
	{
		var inputUuid = $("#vote-uuid").val();
		var inputToken = $("#vote-token").val();

		// Check valid input
		if (inputToken == "")
		{
			new PNotify({
				text: 'Please fill Token value',
				type: 'error'
			});
		}

		var post_data = JSON.stringify({token: inputToken, uuid:inputUuid});

		$.post( BASE_URL+"/vote", post_data, function (data){
			if (data.error){
				new PNotify({
					text: data.error,
					type: 'error'
				});
			}

			if (data.success) {
				new PNotify({
					text: data.success,
					type: 'success'
				});
			
				$('#modal-view-player').modal('hide');
				$('#modal-vote-server').modal('show');

				notifyReward(data.item_reward);
			}
		});
	}


	function load_summary_players (data)  {


		// List players top votes
		var content = "";
		for (var i=0; i < data.top_votes.length; i++)
		{
			var player = data.top_votes[i];
			content += "<code>"+player.username+" ("+player.vote+")</code> ";
		}
		$("#top-votes").html(content);

		// List active players
		content = "";
		for (var i=0; i < data.active_players.length; i++)
		{
			var player = data.active_players[i];
			content += "<code>"+player+"</code> ";
		}
		$("#active-players-list").html(content);
		$("#active-players-count").html(data.active_players.length);


		// If server offline
		if (data.error)
		{
			$("#online-server").show();
			return;
		}

		// Count Online players
		$("#online-players-count").html(data.online);
		
		$("#online-server").hide();


		// List players online
		content = "";
		if (data.online > 0)
		{
			for (var i=0; i < data.sample.length; i++)
			{
				var player = data.sample[i];
				content += "<code>"+player.name+"</code> ";
			}
		}
		$("#online-players-list").html(content);
	}

	function load_datatable (data)  {
		var dataSet = [];
		for (var i = 0; i < data.length; i++) {
			var player = data[i];

			// convert dates
			if (player.last_online == 0)
				player.last_online = "";
			else
				player.last_online = jQuery.timeago(new Date(1000*player.last_online));
			
			player.created = format_timestamp (player.created);

			// create datatable-uuid link
			player.name = "<a style=\"cursor:pointer\" class=\"datatable-uuid\" data-uuid=\"" +
				player.uuid + 
				"\">"+player.name + 
				"</a>";

			if (!player.enderchest_content)
				player.enderchest_content = "[]";

			var count_enderchest = JSON.parse(player.enderchest_content).length;

			dataSet.push([
				player.name,
				player.lives,
				player.votes,
				player.score,
				count_enderchest+" items",
				player.last_online
			]);
		}

		$('#datatable-players').dataTable({
			"order": [[3,"desc" ]],
			"data": dataSet,
			"fnDrawCallback": function( oSettings ) {
				$('.datatable-uuid').unbind("click").click(load_player_details);
			}
		});

	}
}

/****************************
 *
 * Controller tab Structures
 *
 ****************************/
function load_tab_structures ()
{
	$.get(BASE_URL+"/structures", load_structures);

	function load_structures(data)
	{
		var dom_structures = "";

		for (var i=0 ; i < data.length ; i++)
		{
			var structure = data[i];

			dom_structures += '<div class="pull-left structure">';
			dom_structures += '<div class="thumbnail">';
			
			dom_structures += '<a class="fancybox" rel="gallery-minecraft" href="'+structure.photo+'" title="'+structure.title+'">';
			dom_structures += '<img class="img-thumbnail" src="'+structure.thumbnail+'" alt="'+structure.title+'">';
			dom_structures += '</a>';

			dom_structures += '<div class="caption">';
			dom_structures += '<h4>'+structure.title+'</h4>';
			dom_structures += '<p class="text-muted">Created on <span class="label label-default">'+format_timestamp(structure.date)+'</span><br>';
			dom_structures += 'Radius property <span class="label label-primary">'+structure.radius+' blocks</span></p>';
			dom_structures += '</div>';

			dom_structures += '</div>';
			dom_structures += '</div>';
		}

		$("#structures-box").html(dom_structures);
		$(".fancybox").fancybox();
	}
}


/****************************
 *
 * Controller tab Map
 *
 ****************************/
function load_tab_map ()
{
	$.get(BASE_URL+"/explored_biomes", load_explored_biomes);

	function load_explored_biomes(data)
	{
		$("#biomes-to-explore").html(create_dom_biomes(data));
		$("#total-biomes-explored").html(data.length);
	}
}

/****************************
 *
 * Controller tab Statistics
 *
 ****************************/

function load_tab_statistics ()
{
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
}

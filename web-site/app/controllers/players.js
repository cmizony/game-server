
app.controller('PlayersController', function ($scope) {
	
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
			content += "<code style=\"cursor:pointer\" class=\"player-modal\" data-uuid=\"" +	player.uuid + "\">" + player.username+" ("+player.vote+")</code> ";
		}
		$("#top-votes").html(content);

		// List active players
		content = "";
		for (var i=0; i < data.active_players.length; i++)
		{
			var player = data.active_players[i];
			content += "<code style=\"cursor:pointer\" class=\"player-modal\" data-uuid=\"" +	player.uuid + "\">" + player.username + "</code> ";
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
    
    // Bind modal click
    $('.player-modal').unbind("click").click(load_player_details);
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
			player.name = "<a style=\"cursor:pointer\" class=\"player-modal\" data-uuid=\"" +
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
				$('.player-modal').unbind("click").click(load_player_details);
			}
		});

	}

});


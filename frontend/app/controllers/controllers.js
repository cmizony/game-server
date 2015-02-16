
app.controller('EventsController', function ($scope) {

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
});

app.controller('RewardsController', function ($scope) {

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
});

app.controller('ForumController', function ($scope) {

});

app.controller('StructuresController', function ($scope) {
	
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
});

	

app.controller('MapController', function ($scope) {
	
	$.get(BASE_URL+"/explored_biomes", load_explored_biomes);

	function load_explored_biomes(data)
	{
		$("#biomes-to-explore").html(create_dom_biomes(data));
		$("#total-biomes-explored").html(data.length);
	}

});

app.controller('EmptyController', function ($scope) {

});

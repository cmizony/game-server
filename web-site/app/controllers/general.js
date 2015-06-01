
app.controller('GeneralController', function ($scope) {

	$('[data-toggle="tooltip"]').tooltip();
	$("#join-submit").click(send_suscription);
	$.get(BASE_URL+"/summary_donations", load_summary_donations);

	// Bind feature to open tabs
	$("#feature-lives").click(function(){ window.location.href='/players' });
	$("#feature-score").click(function(){ window.location.href='players' });
	$("#feature-rewards").click(function(){ window.location.href='/rewards' });
	$("#feature-structures").click(function(){ window.location.href='/structures' });
	$("#feature-map").click(function(){ window.location.href='/map' });

	function load_summary_donations (data)  {
		var content = "";
		
		// Top daily donator
		content = "<code>"+data.top_weekly.username+" $"+data.top_weekly.amount+"</code> ";
		$("#weekly-donator").html(content);
		
		
		// Top daily donator
		content = "<code>"+data.top_daily.username+" $"+data.top_daily.amount+"</code> ";
		$("#daily-donator").html(content);

		// Sum monthly donation
		var dailyServerCost = 0.4;
    var serverCreation = new Date(2014,9);
    var daysDifference = (new Date() - serverCreation) / 86400000;
    var payedDays = data.sum_total / dailyServerCost;

		var percentage = parseInt(payedDays*100/daysDifference);

		$("#progress-donation").css("width",Math.min(100,percentage) + "%");
		$("#progress-donation").html(percentage + "%");
		$("#total-donation").html("<code>$" +  data.sum_total + "</code>");
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
});

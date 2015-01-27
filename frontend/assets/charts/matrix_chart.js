
function matrixChart()
{
	// Default config
	var data = [],
		callbackUpdate = function(){};


	function my(container) {

		var maxHour = -1;
		createHeader();
		createBody();
		createTable();
		applyStyle();
		
		defaultLasthour();
		
		var header;

		function createHeader() {

			header = $('<thead>');

			var tr = $('<tr>');

			var td = $('<td>');
			td.html('- all -');

			tr.append(td);
			td.css({'cursor' : 'pointer'});
			td.mouseup(eventClickAll);

			var clock = ' am';

			for (var i = 0 ; i < 13 ; i ++)
			{
				if (i == 12 && clock == ' pm')
					break;

				var td = $('<td>',{
					'data-value' : clock == ' am'?i:i+12
				});
				td.css({'cursor' : 'pointer'});

				td.html(i + clock);
				td.mouseup(eventClickHour);

				tr.append(td);

				if (i == 12 && clock == ' am')
				{
					clock = ' pm';
					i = 0;
				}
			}

			header.append(tr);
		}


		var body;

		function createBody() {
			
			body = $('<tbody>');

			for (var name in data)
			{
				var row = $('<tr>');

				var td = $('<td>',{'data-value' : name,});
				td.css({'cursor' : 'pointer'});

				td.html(name);

				td.mouseup(eventClickName);

				row.append(td);
				
				var value = data[name];
				var current_hour = -1;

				for (var hour in value)
				{
					// Fill middle gab with empty columns
					for (var i = 0 ; i < hour - current_hour -1 ; i ++)
						row.append( $('<td>' , { 'class' : 'active' }) );

					var td = $('<td>', {'class' : 'success'});

					var label = $('<label>');
					var input = $('<input>' , {
						'name' : name,
						'value' : hour,
						'type' : 'checkbox'
					});

					input.click(eventUpdate);

					label.append(input);
					td.append(label);
					row.append(td);

					current_hour = hour;
					maxHour = Math.max(maxHour,hour);
				}

				// Fill end gab with empty columns
				for (var i = 0 ; i < 23-current_hour ; i ++)
					row.append( $('<td>' , { 'class' : 'active' }) );

				body.append(row);
			}
		}

		var table;

		function createTable () {
			$(container).empty();

			table = $('<table>', {
				'class' : 'table table-condensed table-bordered'
			});

			table.append(header);
			table.append(body);

			$(container).append(table);
		}

		function applyStyle()
		{

			$(container+' tr td').css({
				'text-align' : 'center',
				'vertical-align' : 'center'
			});

			$(container +' input').css({
				'cursor' : 'pointer'
			});

			$(container +' label').css({
				'margin-top' : '3px',
				'display' : 'inline-block',
				'width' : '100%',
				'height' : '100%',
				'cursor' : 'pointer'
			});

			$(container +' tbody tr td').css({
				'padding' : '0px'
			});

			$(container + ' thead tr td').css({
				'font-size' : '80%',
				'padding' : '0px',
				'margin' : '0px',
				'padding-top' : '3px',
				'padding-bottom' : '3px',
			});
		}

		function defaultLasthour ()
		{
			$(container+' input[value="' + maxHour + '"]').each(function () {
				$(this).prop('checked',true);
			});

			eventUpdate();
		}

		function eventClickAll (elem)
		{
			// Verify if checked
			var all_check = true;
			$(container+' input').each(function () {
				if (!this.checked)
					all_check = false;
			});
				
			// Update checkbox
			$(container+' input').each(function () {
				$(this).prop('checked',!all_check);
			});

			eventUpdate();
		}

		function eventClickName (elem)
		{
			var value = $(elem.target).data('value');
	
			// Verify if checked
			var all_check = true;
			$(container+' input[name="'+value+'"]').each(function () {
				if (!this.checked)
					all_check = false;
			});
				
			// Update checkbox
			$(container+' input[name="'+value+'"]').each(function () {
				$(this).prop('checked',!all_check);
			});

			eventUpdate();
		}

		function eventClickHour (elem)
		{
			var value = $(elem.target).data('value');
	
			// Verify if checked
			var all_check = true;
			$(container+' input[value="'+value+'"]').each(function () {
				if (!this.checked)
					all_check = false;
			});
				
			// Update checkbox
			$(container+' input[value="'+value+'"]').each(function () {
				$(this).prop('checked',!all_check);
			});

			eventUpdate();
		}

		function eventUpdate ()
		{
			var checked = [];

			$(container+' input[type=checkbox]').each(function () {
				if (this.checked) 
					checked.push( { name : this.name, value : this.value });
			});

			callbackUpdate(checked);
		}
	}


	my.data = function(value) {
		if (!arguments.length) return data;
		data = value;
		return my;
	};

	my.callbackUpdate = function(value) {
		if (!arguments.length) return callbackUpdate;
		callbackUpdate = value;
		return my;
	};

	return my;
}

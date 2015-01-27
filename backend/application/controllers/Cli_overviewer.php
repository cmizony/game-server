<?php

defined('BASEPATH') OR exit('No direct script access allowed');

class Cli_overviewer extends CI_Controller {

	public function __construct()
	{
		parent::__construct();
		if (!$this->input->is_cli_request())
			show_404();
	}
	
	/**********************
	 * Crontab example
	 *
	 *	1-59/2 * * * * cd /var/www/html/app ; php index.php cli_overviewer update_logs
	 *	30 5 * * * cd /var/www/html/app ; php index.php cli_overviewer render_map
	 *
	 */

	public function index ()
	{
		echo "CLI Overviewer help:\n";
		echo "\tadd_structure <player_name> <x> <y> <z> <photo> [title=Home] [radius=100]\n";
		echo "\tadd_in_whitelist <player_name> <structure_title> <new_player>\n";
		echo "\trender_map\n";
		echo "\tstructure_tour <player_name>\n";
		echo "\tfind_griefer <x> <y> <z>\n";
	}

	public function find_griefer($x,$y,$z)
	{
		$this->load->helper('minecraft');

		$date = strtotime("-7 days");
		
		$this->db->select('*');
		$this->db->from('logs');
		$this->db->where('date >=',$date);
		$this->db->order_by("name");
		$this->db->order_by("date","desc");
		$query = $this->db->get();

		$location = array (
			"x" => $x,
			"y" => $y,
			"z" => $z
		);
		$display_next = NULL;
		
		foreach ($query->result() as $row)
		{
			$row_location = array (
				"x" => $row->x,
				"y" => $row->y,
				"z" => $row->z
			);

			if (!is_null($display_next))
			{
				echo "$row->name\n";
				$display_next --;

				if ($display_next == 0)
					$display_next = NULL;
			}

			if (distance_3d($location,$row_location) <= 20)
			{
				echo "$row->name at ".date("F j, g:i a",$row->date)."\n";
				print_r(json_decode($row->actions));
				$display_next = 2;
			}
		}
	}


	public function structure_tour ($player)
	{
		//  Get player
		$query = $this->db->get_where('players',array("name" => $player));
		if ($query->num_rows() == 0)
		{
			echo "$player does not exist\n";
			return FALSE;
		}
		$player = $query->first_row(); 

		// Get structure
		$query = $this->db->get('structures');
		$structures = $query->result();

		// get Location player
		$nbt_player = $this->server->nbt_player($player->uuid);
		foreach ($nbt_player['value'] as $item)
		{
			if ($item['name'] == "Pos") 
			{
				$pos = $item['value']['value'];
				$original_x = $pos[0];
				$original_y = $pos[1];
				$original_z = $pos[2];
			}
		}

		// Start tour
		$this->server->send("cmd tell $player->name Tour of all structures");
		$this->server->send("cmd tell $player->name You have 1 minute per structure");
		$this->server->send("cmd gamemode spectator $player->name");

		foreach ($structures as $structure)
		{
			$this->server->send("cmd tp $player->name $structure->x $structure->y $structure->z");
			$this->server->send("cmd tell $player->name $structure->title");
			sleep(60);
		}

		$this->server->send("cmd tp $player->name $original_x $original_y $original_z");
		$this->server->send("cmd gamemode survival $player->name");
	}

	public function render_map ()
	{
		$cmd = "overviewer.py --config=application/third_party/overviewer/config.py";
		shell_exec($cmd);

		$map_link = $this->config->item('map_link');

		/*
		 * Inject Markers
		 *
		 * Make sure bootstrap in index.html for overviewer
		 */

		$structures_js_path = APPPATH.'/third_party/overviewer/structures_markers.js';
		$js_structures = file_get_contents($structures_js_path);

		$players_js_path = APPPATH.'/third_party/overviewer/players_markers.js';
		$js_players = file_get_contents($players_js_path);

		file_put_contents("/var/www/html/$map_link/baseMarkers.js",$js_structures.$js_players);

		// Patch index for external resources
		$cmd = "patch /var/www/html/$map_link/index.html ".APPPATH."/third_party/overviewer/index.patch";
		shell_exec($cmd);
	}

	public function archive_logs() // TODO dump sql on disk
	{
	}

	public function add_in_whitelist ($player_name, $structure_title, $new_player)
	{
		// Get Player owner of structure
		$query = $this->db->get_where('players',array("name" => $player_name));
		if ($query->num_rows() == 0)
		{
			echo "$player_name does not exist\n";
			return FALSE;
		}
		$player_owner = $query->first_row(); 

		// Get new player
		$query = $this->db->get_where('players',array("name" => $new_player));
		if ($query->num_rows() == 0)
		{
			echo "$new_player does not exist\n";
			return FALSE;
		}
		$new_player = $query->first_row(); 

		// Get structure
		$query = $this->db->get_where('structures',array(
			"uuid" => $player_owner->uuid,
			"title" => $structure_title));
		if ($query->num_rows() == 0)
		{
			echo "$structure_title does not exist for player $player_name\n";
			return FALSE;
		}
		$structure = $query->first_row(); 

		// Add in whitelist
		$whitelist = json_decode($structure->whitelist);
		array_push($whitelist,$new_player->uuid);

		$this->db->where('id',$structure->id);
		$this->db->update('structures',array('whitelist' => json_encode($whitelist)));
	}

	public function add_structure ($player_name,$x,$y,$z,$photo,$title = "Home",$radius = 100)
	{
		$this->db->select('uuid,name,gmail');
		$this->db->from('players');
		$this->db->where('name',$player_name);
		$query = $this->db->get();

		if ($query->num_rows() == 0)
		{
			echo "Player $player_name does not exsits\n";
			return FALSE;
		}

		$photo_path = "upload/";
		if (!file_exists("$photo_path$photo"))
		{
			echo "Photo $photo does not exists in $photo_path\n";
			return FALSE;
		}

		// Upload Photo
		$this->load->library('image_lib');

		$path_info = pathinfo($photo);
		$photo_name = md5(uniqid()).".".$path_info['extension'];
		$config = array();

		// Full size
		$config['new_image'] = "assets/structures/$photo_name";
		$config['image_library'] = 'gd2';
		$config['source_image'] = "$photo_path$photo";
		$config['maintain_ratio'] = TRUE;
		$config['width'] = 1024;
		$config['height'] = 768;

		$this->image_lib->initialize($config);

		if (!$this->image_lib->resize())
		{
			echo "Image $photo can not be resized\n";
			echo $this->image_lib->display_errors('','')."\n";
			return FALSE;
		}

		// Thumbnail
		$this->image_lib->clear();
		$config['new_image'] = "assets/structures/thumbnail_$photo_name";
		$config['width'] = 192;
		$config['height'] = 144;
		$this->image_lib->initialize($config);

		if (!$this->image_lib->resize())
		{
			echo "Thumbnail for image $photo can not be resized\n";
			echo $this->image_lib->display_errors('','')."\n";
			return FALSE;
		}

		// Create structure
		$player = $query->first_row();
		$whitelist = array ($player->uuid);
		$x = floatval($x);
		$y = floatval($y);
		$z = floatval($z);

		$structure = array(
			'uuid' => $player->uuid,
			'title' => "$player_name $title",
			'date' => time(),
			'whitelist' => json_encode($whitelist),
			'radius' => intval($radius),
			'photo' => $photo_name,
			'x' => $x,
			'y' => $y,
			'z' => $z
		);
		
		$this->db->insert('structures', $structure);
		unlink("$photo_path$photo");

		echo "Added $title for $player_name at ($x;$y;$z)\n";
		echo "Do you want to get him a reward?\n";
		echo "php index.php cli_minecraft create_reward $player->uuid \"$title\"\n";
	}

	/*
	 * Server update on disk every ~50 sec
	 * Cron update log run every 2 minutes
	 */
	public function update_logs ()
	{
		$online_players = $this->server->get_players(); 
		
		if (!$online_players)
			return;
		
		$online_players = $online_players['sample'];

		$players_name = array();
		foreach ($online_players as $player)
			array_push($players_name,strtolower($player['name']));

		if (empty($players_name))
			return FALSE;

		$this->db->select('structures.id,name,title,x,y,z,whitelist,radius');
		$this->db->from('structures');
		$this->db->join('players', 'players.uuid = structures.uuid');
		$query = $this->db->get();
		$structures = $query->result();

		$this->load->helper('minecraft');

		$this->db->select('*');
		$this->db->from('players');
		$this->db->where_in("lower(name)",$players_name);
		
		$query = $this->db->get();
		
		$new_logs=array();
		$update_data = array();

		$current_date = strtotime("now");

		foreach ($query->result() as $row)
		{
			$nbt_player = $this->server->nbt_player($row->uuid);

			if (!$nbt_player)
				continue;

			$new_stats = $this->server->get_stats($row->uuid);

			$previous_stats = json_decode($row->last_stats);
			if (empty($previous_stats))
				$previous_stats = array();
			else 
				$previous_stats = get_object_vars ($previous_stats);

			/*
			 * Calculate Diff actions
			 */

			$stats_to_save = array(
				"stat.craftItem",
				"stat.useItem",
				"stat.mineBlock",
				"killEntity"
			);

			// Epurate sub array
			foreach ($previous_stats as &$stat)
				if (is_array($stat))
					$stat = "";
			foreach ($new_stats as &$stat)
				if (is_array($stat))
					$stat = "";

			$diff_stats = array_diff_assoc($previous_stats,$new_stats);

			$actions = array();
			foreach ($diff_stats as $key => $value)
			{
				$valid_stat = FALSE;
				foreach ($stats_to_save as $save)
				{
					if (strpos($key,$save) !== FALSE)
					{
						$valid_stat = TRUE;
						break;
					}
				}

				if (!$valid_stat)
					continue;

				$action_value = $new_stats[$key];

				if (isset($previous_stats[$key]))
					$action_value = $new_stats[$key] - $previous_stats[$key];

				$action_key = str_replace("."," ",
					str_replace("minecraft.","",
					str_replace("stat.","",$key)));

				$actions[$action_key] = $action_value;
			}

			// End Diff calculate

			$log = array(
				"uuid" => $row->uuid,
				"name" => $row->name,
				"date" => $current_date,
				"actions" => json_encode($actions)
			);

			/*
			 * Get nbt data
			 */
			$new_inventory = '[]';

			foreach ($nbt_player['value'] as $item)
			{
				if ($item['name'] == "playerGameType")
					$log['game_type'] = $item['value'];

				if ($item['name'] == "Inventory")
					$new_inventory = json_encode($item['value']);

				if ($item['name'] == "Health")
					$log['health'] = $item['value'];

				if ($item['name'] == "XpLevel")
					$log['xp_level'] = $item['value'];

				if ($item['name'] == "XpP")
					$log['xp_progress'] = $item['value'];

				if ($item['name'] == "foodLevel")
					$log['food_level'] = $item['value'];

				if ($item['name'] == "Pos") 
				{
					$pos = $item['value']['value'];
					$log['x'] = $pos[0];
					$log['y'] = $pos[1];
					$log['z'] = $pos[2];
				}

				if ($item['name'] == "Dimension")
				{
					$dimension = $item['value'];

					if ($dimension === -1)
						$dimension = "Nether";
					if ($dimension === 0)
						$dimension = "Overworld";
					if ($dimension === 1)
						$dimension = "End";

					$log['dimension'] = $dimension;	
				}
			}

			/*
			 * Calculate inventory diff
			 */
			$last_inventory = $row->last_inventory;

			if (empty($last_inventory))
				$last_inventory = '[]';

			$items_diff = diff_inventory($last_inventory,$new_inventory);
			$log['inventory'] = json_encode($items_diff);


			/*
			 * Check structures if normal user
			 */
			$last_location = json_decode($row->last_location);

			if (is_null($last_location))
				$last_location = array("x" => 0, "y" => 0, "z" => 0);

			$new_location = array (
				"x" => $log['x'],
				"y" => $log['y'],
				"z" => $log['z']
			);

			if ($log['game_type'] == 0) 
			{
				foreach ($structures as $structure)
				{
					// Test if player inside area
					if (distance_3d($structure,$new_location) <= (2 * $structure->radius))
					{
						$whitelist = json_decode($structure->whitelist);

						// Test if player in whitelisted
						if (in_array($row->uuid,$whitelist))
							continue;

						// In area	
						if (distance_3d($structure,$last_location) > (2 * $structure->radius))
						{
							$this->load->library('promotion');
							$this->promotion->email_structure($structure->id,$row->name);
							$this->server->send("cmd tell $structure->name $row->name entered in $structure->title");
						}

						// In House
						if (distance_3d($structure,$new_location) <= $structure->radius AND
							distance_3d($structure,$last_location) > $structure->radius)
						{
							$this->server->send("cmd tell $row->name You entered in the area of $structure->title - Please respect the property");
						}

					}

				}
			}

			array_push($new_logs,$log);
			array_push($update_data,array(
				"uuid" => $row->uuid,
				"last_stats" => json_encode($new_stats),
				"last_inventory" => $new_inventory,
				"last_location" => json_encode($new_location)
			));

		}

		if (count($update_data) > 0)
			$this->db->update_batch('players', $update_data, 'uuid'); 

		if (count($new_logs) > 0)
			$this->db->insert_batch('logs',$new_logs);


	}


}

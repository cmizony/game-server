<?php

defined('BASEPATH') OR exit('No direct script access allowed');

class Cli_minecraft extends CI_Controller {

	public function __construct()
	{
		parent::__construct();
		if (!$this->input->is_cli_request())
			show_404();

	}

	/**********************
	 * Crontab example
	 *
	 *	# Restart server in case of Crash & inform
	 *	0,15,30,45,50,55 4 * * * /usr/local/bin/msm hardcore say The server will restart at 5am EST
	 *
	 *	# Run CLI
	 *	0,10,20,30,40,50 * * * * cd /var/www/html/app ; php index.php cli_minecraft check_online;
	 *	*\/5 * * * * cd /var/www/html/app ; php index.php cli_minecraft update_players;
	 *	30 4 1 * * cd /var/www/html/app ; php index.php cli_minecraft epurate_server;
	 *	0 5 * * * cd /var/www/html/app ; php index.php cli_minecraft update_server;
	 *	0 4 * * 1 cd /var/www/html/app ; php index.php cli_minecraft reward_players;
	 *	*\/5 * * * * cd /var/www/html/app ; php index.php cli_minecraft update_players;
	 *	3,13,23,33,43,53 * * * * cd /var/www/html/app ; php index.php cli_minecraft send_announcement;
	 *
	 */
		
	public function index ()
	{
		echo "CLI Minecraft\n";
		echo "\t add_life <player_name>\n";
		echo "\t create_reward <player_uuid> [source=Manual]\n";
		echo "\t check_online\n";
		echo "\t update_server\n";
		echo "\t reward_players\n";
		echo "\t update_players\n";
		echo "\t send_announcement\n";
		echo "\t epurate_server\n";
	}

	public function check_online ()
	{
		$online = $this->server->get_players(); 

		if (!$online)
			$this->server->send("start");
	}

	// Daily Event (Execute at 5 AM) 
	public function update_server ()
	{
		// Un-ban players & update token
		$hardcore_deaths = $this->server->get_dead();

		$this->load->helper('minecraft');

		$this->db->select('uuid,lives,name,gmail,enderchest_backup,map_access');
		$this->db->from('players');

		$query = $this->db->get();

		foreach ($query->result() as $row)
		{
			$data = array();
			$enderchest = $this->server->get_enderchest($row->uuid);

			// If dead
			if (in_array($row->uuid,$hardcore_deaths))
			{
				if ($row->lives > 0)
				{
					// Backup enderChest if not empty
					if (!empty(json_decode($enderchest)))
						$data['enderchest_backup'] = $enderchest;

					// Resurrection
					$this->server->unban($row->uuid, $row->name);

					$cmd = "rm ".Server::$path."playerdata/$row->uuid.dat";
					shell_exec("sudo -u minecraft $cmd");

					// Set tp to spawn
					$cmd = "cmd scoreboard players set $row->name status 0";
					$this->server->send($cmd);

					$this->load->library('promotion');
					$this->promotion->email_life($row->gmail,$row->name); 

					$data['lives'] = intval($row->lives)-1;

				}
			}
			// If alive
			else
			{
				// Backup enderChest
				$data['enderchest_content'] = $enderchest;

				if (!empty($row->enderchest_backup))
				{
					$cmd= "cmd kick $row->name Server reset";
					$this->server->send($cmd);

					sleep(1);

					$new_enderchest = fill_chest(json_decode($enderchest),json_decode($row->enderchest_backup));
					$this->server->set_enderchest($row->uuid,json_encode($new_enderchest));

					$data['enderchest_content'] = $row->enderchest_backup;
					$data['enderchest_backup'] = "";
				}

			}

			// Check map access
			if ($row->map_access == 0)
			{
				$server_biomes = $this->server->explored_biomes();
				$player_stats = $this->server->get_stats($row->uuid);

				if (isset($player_stats['achievement.exploreBiomesProgress']))
				{
					if (count($server_biomes) ==
						count($player_stats['achievement.exploreBiomesProgress']))
          {
            /* Disable feature
						$this->load->library('promotion');
						$this->promotion->email_map($row->gmail,$row->name); 
            $data['map_access'] = 1;
             */
					}
				}
			}

			// Generate token
			$token = $this->server->generate_token();
			$data['token'] = $token;

			// Reset location
			$data['last_location'] = '';

			$this->db->where('uuid', $row->uuid);
			$this->db->update('players', $data);
		}
		
		// Clean Backup	
		$this->server->clean_backup();

		// Restart
		$this->server->send("restart");
		
		// Reward top daily donator
		$top_daily_donator = $this->server->top_tips_from(strtotime('yesterday'));
		$this->add_life($top_daily_donator->username);
	}

	// Weekly Event (Execute on monday 4 AM -before update server)
	public function reward_players ()
	{
		// Top 3 votes
		$this->db->select('name,votes');
		$this->db->from('players');
		$this->db->where('votes >',0);
		$this->db->order_by('votes','desc');
		$this->db->order_by('score','desc');
		$this->db->limit('3');
		$query = $this->db->get();

		foreach ($query->result() as $row)
			$this->add_life($row->name);

		// Reset votes
		$data['votes'] = 0;
		$this->db->update('players', $data);

		// Top Donator
		$top_weekly_donator = $this->server->top_tips_from(strtotime('last monday 4AM'));
		$this->add_life($top_weekly_donator->username);
	}

	// 5 min Event
	public function update_players ()
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

		$this->db->select('*');
		$this->db->from('players');
		$this->db->where_in("lower(name)",$players_name);
		
		$max_lives = $this->config->item('max_lives');
		$query = $this->db->get();

		foreach ($query->result() as $row)
		{
			$data = array();

			// Welcome message
			if ($row->last_online == 0)
			{
				$cmd= "cmd tell $row->name Welcome $row->name to our hardcore server. You can see your number of lives on the sidebar, if you die you will be automatically resurrected the day after.";
				$this->server->send($cmd);

				// Give start kit
				$this->load->helper('minecraft');

				$spawn = (object)$this->config->item('spawn_location');
				$spawn_radius = $this->config->item('spawn_radius');
				$last_location = json_decode($row->last_location);

				if ($row->spawn_kit == 0 AND
					distance_3d($spawn,$last_location) < $spawn_radius)
				{
					$starter_kit = $this->config->item('starter_kit');
					$data['spawn_kit'] = 1; 

					foreach ($starter_kit as $item)
						$this->server->send("cmd give $row->name $item");
					
					$cmd= "cmd tell $row->name Here is your starter kit. If you choose to not keep it put it in the trash and once teleported you will get an extra life!";
					$this->server->send($cmd);
				}
			}


			// Info player reach max lives
			if ($row->lives >= $max_lives)
			{
				// 20% chance to receive the message
				if (rand(0,100) >= 80)
				{
					$cmd= "cmd tell $row->name You have reach the maximum number of lives. Please considere voting for other players";
					$this->server->send($cmd);
				}

			}

			// Reward life based on start kit
			if ($row->spawn_kit == 1)
			{
				$this->load->helper('minecraft');
				$spawn = (object)$this->config->item('spawn_location');
				$spawn_radius = $this->config->item('spawn_radius');
				$starter_kit_life = $this->config->item('starter_kit_life');
				$last_location = json_decode($row->last_location);

				if (distance_3d($spawn,$last_location) > $spawn_radius)
				{
					$nbt_player = $this->server->nbt_player($row->uuid);

					foreach ($nbt_player['value'] as $item)
						if ($item['name'] == "Inventory")
							$inventory = json_encode($item['value']);

					$inventory = parse_inventory($inventory);
					$add_life = TRUE;

					foreach ($inventory as $item => $count)
						if (in_array($item,$starter_kit_life))
							$add_life = FALSE;

					if ($add_life)
					{
						$cmd= "cmd tell $row->name You seem to have choosen to not keep the starter kit, so you have 3 lives. Good luck!";
						$this->server->send($cmd);
						$this->add_life($row->name);
					}
					else
					{
						$cmd= "cmd tell $row->name You seem to have choosen to keep the starter kit, so you stay at 2 lives. Good luck!";
						$this->server->send($cmd);
					}
					
					$data['spawn_kit'] = 0; 
				}
			}

			// Send vote token
			if ($row->token != 0)
			{
				$cmd= "cmd tell $row->name Your daily token to vote on the website is $row->token. You get an item reward after you vote for someone.";
				$this->server->send($cmd);
			}

			// Inform email not verified
			if ($row->verified =! 1) 
			{
				$cmd= "cmd tell $row->name Please verify your email address. The link was sent on the welcome email you received from the server. If you do not find it check your spam folder. Unverified account will be ban at the end of the month";
				$this->server->send($cmd);
			}

			// Inform how to get lives
			if ($row->lives <= 1)
			{
				$cmd= "cmd tell $row->name To get lives you can vote on the website or make a donation. Top 3 weekly votes get 1 life each - Top daily donator gets 1 life - Top weekly donator gets 1 life.";
				$this->server->send($cmd);
			}


			// Update points
			$new_score = $this->server->get_score($row->uuid);
			$score_increase = $new_score - $row->score;

			// Inform point system
			if ($row->score < $new_score)
			{
				$cmd= "cmd tell $row->name Your score increased by $score_increase within the last 5 minutes - press tab to see it. Details on the website.";
				$this->server->send($cmd);

			}

			if ($row->score < 1000 AND $new_score >= 1000 OR
				$row->score < 2000 AND $new_score >= 2000 OR
				$row->score < 3000 AND $new_score >= 3000 OR
				$row->score < 4000 AND $new_score >= 4000 OR
				$row->score < 5000 AND $new_score >= 5000 OR
				$row->score < 6000 AND $new_score >= 6000 OR
				$row->score < 7000 AND $new_score >= 7000 OR
				$row->score < 8000 AND $new_score >= 8000 OR
				$row->score < 9000 AND $new_score >= 9000 OR
				$row->score < 10000 AND $new_score >= 10000 OR
				$row->score < 11000 AND $new_score >= 11000 OR
				$row->score < 12000 AND $new_score >= 12000)
			{
				$cmd= "cmd tell $row->name To reward your significant score increase - every 2000 points - you got an items package. Please check your email to access it.";
				$this->server->send($cmd);
				$source = "Score increase to $new_score";
				$this->create_reward($row->uuid,$source);
			}

			// Restore Ender Chest
			if ($row->enderchest_backup != "")
			{
				$cmd= "cmd tell $row->name The content of your EnderChest will be restored at the next server reset. Please leave it empty for now.";
				$this->server->send($cmd);
			}

			// Give item reward
			if (!empty($row->item_reward))
			{
				$pieces = explode(" ",$row->item_reward);
				$name = str_replace('minecraft:','',$pieces[0]);
				$count = $pieces[1];

				$cmd= "cmd tell $row->name You got $count $name as a reward because you did vote!";
				$this->server->send($cmd);

				$this->server->send("cmd give $row->name $row->item_reward");
				$data['item_reward'] = '';
			}

			$data['last_online'] = strtotime("now");
			$data['score'] = $new_score;
			
			$this->db->where('uuid', $row->uuid);
			$this->db->update('players', $data);
			
			$just_arrived = (time() - $row->last_online) > (60*7);

			// Set scoreboard score
			if ($just_arrived OR $score_increase)
			{
				$cmd = "cmd scoreboard players set $row->name score $new_score";
				$this->server->send($cmd);
			}

			// Set scoreboard lives
			if ($just_arrived)
			{
				$cmd = "cmd scoreboard players set $row->name lives $row->lives";
				$this->server->send($cmd);
			}
		}

		
	}


	// 10 min Event
	public function send_announcement ()
	{
		$announcements = $this->config->item('announcements');

		if (empty($announcements))
			return;

		$count = count($announcements);
		$key = rand(0,$count-1);

		$message = $announcements[$key];

		if ($message == "top_donators")
		{
			$top_daily_donator = $this->server->top_tips_from(strtotime("today 5AM"));
			
			$top_weekly_donator = $this->server->top_tips_from(strtotime('last monday 4AM', strtotime('tomorrow')));
			
			$message = "[Top donations] ";
			$message .= "Today: $top_daily_donator->username ".$top_daily_donator->amount." dollars Get 1 life - ";
			$message .= "This week: $top_weekly_donator->username ".$top_weekly_donator->amount." dollars Get 1 life";
		}

		if ($message == "top_votes")
		{
			$this->db->select('name,votes');
			$this->db->from('players');
			$this->db->where('votes >',0);
			$this->db->order_by('votes','desc');
			$this->db->order_by('score','desc');
			$this->db->limit('3');
			$query = $this->db->get();

			$message = "[Top 3 weekly votes] ";

			foreach ($query->result() as $row)
				$message .= "$row->name $row->votes - ";

			$message .= ". Get 1 life each";
		}

		$cmd= 'say '.$message;
		$this->server->send($cmd);
		
		// Remove score from unlog players
		$this->db->select('name');
		$this->db->from('players');
		$this->db->where('last_online >',strtotime("- 30min"));
		$this->db->where('last_online <',strtotime("- 6min"));
		$query = $this->db->get();

		foreach ($query->result() as $row)
		{
			$cmd= "cmd scoreboard players reset $row->name lives";
			$this->server->send($cmd);
		}
	}

	public function add_life ($player_name = NULL)
	{
		if (empty($player_name))
			return false;

		$player_name = strtolower($player_name);

		$this->db->select('uuid,lives,name');
		$this->db->from('players');
		$this->db->where('lower(name)',$player_name);
		$query = $this->db->get();

		if ($query->num_rows() == 0)
			return false;

		$player = $query->row();
		$max_lives = $this->config->item('max_lives');
		
		if ($player->lives >= $max_lives)
			return false;

		$new_lives = $player->lives + 1;

		$data = array(
			"lives" => $new_lives
		);

		$this->db->where('uuid', $player->uuid);
		$this->db->update('players', $data);

		$cmd = "cmd scoreboard players set $player->name lives $new_lives";
		$this->server->send($cmd);
		
		return true;
	}

	// Month Event
	public function epurate_server ()
	{
		// TODO check mojand name <-> uuid
		
		// Ban not verfied email players
		$this->db->select('uuid,name,gmail');
		$this->db->from('players');
		$this->db->where('verified',0);
		$query = $this->db->get();
		
		foreach ($query->result() as $row)
		{
			$cmd= "cmd ban $row->name Please verify your email address to be pardon. Check your inbox";
			$this->server->send($cmd);
		}

		// Reset End for Ender Dragon
		$this->server->reset_end();
	}

	public function create_reward($uuid,$source = "Manual")
	{
		$rewards = $this->server->get_all_rewards();

		if (!$rewards)
			return FALSE;

		$slot_types = array(
			'potions',
			'dyes',
			'tools',
			'blocks','blocks','blocks',
			'enchants',
			'ores',
			'drops'
		);

		$final_package = array();

		foreach ($slot_types as $type)
		{
			$items_slots = $rewards->$type;
			$index = rand(0,count($items_slots)-1);

			array_push($final_package,$items_slots[$index]);
		}

		$token = $this->server->generate_token();

		$data = array (
			'uuid' => $uuid,
			'token' => $token,
			'items' => json_encode($final_package),
			'created' => time(),
			'used' => 0,
			'source' => $source
		);

		$this->db->insert('rewards',$data);

		$this->load->library('promotion');
		$this->promotion->email_reward($uuid,$token); 
	}

	public function pvp_event ()
	{
		// TODO
		// Players suscribe on the website for event
		// players get a token in-game to confirm the suscription
		// Inform regularely for next event (and on calendar)
		// Event scheduled every X weeks

		// If enought people for event then start it
		// Wait 15min in players not log in
		// If not minimum players log in cancel event

		// Players are teleported to location (random place in config)
		// Timer X min to let them hide
		// Turn all server into pvp world
		// Test all dead but one or end timer

		// Players alive tp back to spawn
		// If one survival give him an extra life
		// For all dead player give 1 life
		// Rewards are playesr items & extra life
	}
	
}

?>

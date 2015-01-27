<?php
defined('BASEPATH') OR exit('No direct script access allowed');

require APPPATH.'/third_party/minecraft_query/MinecraftServerPing.php';
require APPPATH.'/third_party/minecraft_nbt/nbt.class.php';

class Server {

	protected $_CI;

	// MSM Server configuration
	public static $ip = "localhost";
	public static $port = 25565;
	public static $path = "/opt/msm/servers/hardcore/";
	public static $backup_path = "/opt/msm/archives/worlds/hardcore/world/";
	public static $name = "hardcore";

	/* Need to be in sudoers (visudo)
	 * www-data ALL=(ALL) NOPASSWD: /usr/local/bin/msm,/bin/rm,/bin/chmod
	 * Add www-data in minecraft group
	 * PHP GMP extension required
	 */
	public static $binary = "/usr/local/bin/msm";
	public static $msm_user = "minecraft";

	// Mojang API
	private $mojang_config = array (
		'server' => 'https://api.mojang.com/',
		'ssl_verify_peer' => FALSE
	);

	// StreamTip API
	private $streamtip_config = array (
		'server' => 'https://streamtip.com/api',
		'ssl_verify_peer' => FALSE
	);

	public function get_latest_lag ()
	{
		$log_path = Server::$path."/logs/latest.log";
		$logs = file($log_path);

		$lags =  preg_grep("/^\[\d+:\d+:\d+\] \[Server thread\/WARN\]: Can't keep up.*/",$logs);

		$format = "[%d:%d:%d] [Server thread/WARN]: Can't keep up! Did the system time change, or is the server overloaded? Running %dms behind, skipping %d tick(s)";

		$formatted_logs = array();
		foreach ($lags as $lag)
		{
			sscanf($lag,$format,$hour,$min,$sec,$ms,$ticks);

			$date = strtotime(date('Y-m-d')." $hour:$min:$sec");
			
			array_push($formatted_logs,array(
				"date" => $date,
				"ticks" => $ticks,
				"ms" => $ms
			));
		}

		return $formatted_logs;
	}

	public function explored_biomes ()
	{
		$stats_files = scandir(Server::$path."/stats");
		$biomes_explored = array();

		foreach ($stats_files as $stats_file)
		{
			$json_stats = file_get_contents(Server::$path."/stats/$stats_file");

			$stats = json_decode($json_stats);

			if (is_null($stats))
				continue;

			if (!property_exists($stats,'achievement.exploreAllBiomes'))
				continue;

			$achievement_biomes = $stats->{'achievement.exploreAllBiomes'};
			$progress = $achievement_biomes->progress;

			if (!is_array($progress))
				continue;
			
			$biomes_explored = array_merge($biomes_explored,$progress);
		}

		$biomes_explored = array_unique($biomes_explored);

		return array_values($biomes_explored);
	}

	public function sum_tips_from ($date_from)
	{
		// Call to minecraft API
		$this->_CI =& get_instance();
		$this->_CI->load->library('rest');

		$this->_CI->rest->initialize($this->streamtip_config);
		$this->_CI->rest->http_header(
			"Authorization",
			$this->_CI->config->item('streamtip_client')." ".
			$this->_CI->config->item('streamtip_token')
		);

		$date_from = date(DateTime::ISO8601,$date_from);

		$parameters = array(
			"limit" => 100,
			"date_from" => $date_from,
		);

		
		$result = $this->_CI->rest->get("tips",$parameters);


		if (!$result OR !property_exists($result,"tips"))
			return 0;

		$tips = $result->tips;
		$sum = 0;

		foreach ($tips as $tip)
			$sum += $tip->amount;
	   
		return $sum;
	}

	public function top_tips_from ($date_from)
	{
		// Call to minecraft API
		$this->_CI =& get_instance();
		$this->_CI->load->library('rest');

		$this->_CI->rest->initialize($this->streamtip_config);
		$this->_CI->rest->http_header(
			"Authorization",
			$this->_CI->config->item('streamtip_client')." ".
			$this->_CI->config->item('streamtip_token')
		);

		$date_from = date(DateTime::ISO8601,$date_from);

		$parameters = array(
			"limit" => 100,
			"date_from" => $date_from,
		);

		
		$result = $this->_CI->rest->get("tips",$parameters);


		if (!$result OR !property_exists($result,"tips"))
		{
			$top_donator = new stdClass;
			$top_donator->amount = 0;
			$top_donator->username = "";

			return $top_donator;
		}

		$tips = $result->tips;

		$tips = array_reverse($tips);
		$grouped_tips = array();

		// group by amount
		foreach ($tips as $tip)
		{
			$username = strtolower($tip->username);

			if (!isset($grouped_tips[$username]))
				$grouped_tips[$username] = 0;

			$grouped_tips[$username] += $tip->amount;
		}

		// Find top donator
		$top_donator = new stdClass;
		$top_donator->amount = 0;
		$top_donator->username = "";
		
		foreach ($grouped_tips as $username => $amount)
		{
			if ($amount > $top_donator->amount)
			{
				$top_donator->amount = $amount;
				$top_donator->username = $username;
			}
			// Priority to the first donator
			else if ($top_donator->username != "" AND
					$top_donator->amount == $amount)
			{
				foreach ($tips as $tip)
				{
					$tip->username = strtolower($tip->username);
					
					if ($tip->username == $top_donator->username)
						break;
					if ($tip->username == $username)
					{
						$top_donator->amount = $amount;
						$top_donator->username = $username;
					}
				}
			}
		}

		return $top_donator;
	}

	public function send ($cmd)
	{
		$full_cmd = Server::$binary.' '.Server::$name.' '.$cmd;
		$code = shell_exec("sudo -u minecraft $full_cmd");

		// Pause 10ms to not make the server lag
		usleep(100000);

		return $code;
	}

	public function get_players ()
	{
		$Info = false;
		$Query = null;

		try
		{
			$Query = new MinecraftPing( Server::$ip, Server::$port, 1);
			$Info = $Query->Query( );
		}
		catch( MinecraftPingException $e )
		{
			$Exception = $e;
		}

		if( $Query !== null )
		{
			$Query->Close( );
		}

		if ($Info === False OR !isset($Info['players']))
			return false;

		if ($Info['players']['online'] == 0)
		{
			$Info['players']['sample'] = array();
		}

		return $Info['players'];
	}

	public function get_score ($player_uuid)
	{
		$stats = $this->get_stats($player_uuid);

		$this->_CI =& get_instance();
		$achievements = $this->_CI->config->item('achievements_points');

		if (!$achievements)
			return 0;

		$score = 0;

		foreach ($achievements as $achievement => $difficulty)
		{
			$key = "achievement.".$achievement;
			if (isset($stats[$key]))
			{
				// Calculate points
				$points = 0;
				$value = $stats[$key];

				while ($value > 0 AND $difficulty > 0)
				{
					$points += $difficulty;
					$difficulty = $difficulty / 2;
					$value --;
				}

				$points = round($points);
				$score += $points;
			}
		}

		return $score;
	}

	public function get_stats ($player_uuid)
	{
		$stat_file = Server::$path."stats/$player_uuid.json";

		if (!file_exists($stat_file))
			return false;


		$stat_json = file_get_contents($stat_file);
		$stat_array = (array)json_decode($stat_json);

		// Fix convertion for exploreAllBiomes
		if (isset($stat_array['achievement.exploreAllBiomes']))
		{
			$biomes_achievement = $stat_array['achievement.exploreAllBiomes'];
			$stat_array['achievement.exploreAllBiomes'] = $biomes_achievement->value;
			$stat_array['achievement.exploreBiomesProgress'] = $biomes_achievement->progress;
		}

		return $stat_array;
	}

	public function get_uuid ($player_name)
	{
		// Call to minecraft API
		$this->_CI =& get_instance();
		$this->_CI->load->library('rest');

		$this->_CI->rest->initialize($this->mojang_config);

		$content = json_encode(array($player_name));

		$result = $this->_CI->rest->post("profiles/minecraft",$content,'json');

		if (empty($result))
			return false;
		else
			return array_shift($result);
	}

	public function is_whitelisted ($uuid)
	{
		$whitelist_path = Server::$path."whitelist.json";

		$whitelist = file_get_contents($whitelist_path);

		return strpos ($whitelist,$uuid);
	}

	public function generate_token ()
	{
		// todo avoid collison (generate set of tokens)
		return rand (10000,99999);
	}

	public function unban ($uuid,$name)
	{
		$cmd = "cmd pardon $name";
		$this->send($cmd);
	}

	public function reset_end ()
	{
		$fullpath = Server::$path."worldstorage/world/DIM1";
		shell_exec("sudo -u minecraft chmod -R g+w $fullpath");

		$cmd = "rm $fullpath/region/*.mca";
		shell_exec("sudo -u minecraft $cmd");
	}

	public function get_all_rewards ()
	{
		$rewards = file_get_contents(APPPATH.'/third_party/minecraft_nbt/rewards.json');

		return json_decode($rewards);
	}

	public function get_dead ()
	{
		$whitelist_path = Server::$path."whitelist.json";

		$whitelist_players = json_decode(file_get_contents($whitelist_path));
		$dead_players = array();

		foreach ($whitelist_players as $player)
		{
			$nbt_player = $this->nbt_player($player->uuid); 

			if (!$nbt_player)
				continue;

			foreach ($nbt_player['value'] as $item)
			{
				if ($item['name'] == "Health")
				{
					$health = $item['value'];
					if ($health <= 0)
						array_push($dead_players,$player->uuid);
					break;
				}
			}
		}

		return $dead_players;
	}

	public function nbt_player ($uuid)
	{
		$filename = "$uuid.dat";
		$fullpath = Server::$path."playerdata/$filename";

		if (!file_exists($fullpath))
			return FALSE;

		$nbt = new nbt();
		$nbt->loadFile($fullpath);

		return $nbt->root[0];
	}

	public function get_enderchest ($uuid = NULL)
	{
		$nbt_player = $this->nbt_player($uuid); 

		if (!$nbt_player)
			return json_encode(array());

		foreach ($nbt_player['value'] as $item)
		{
			if ($item['name'] == "EnderItems")
			{
				$ender_items = $item['value']['value'];
				return json_encode($ender_items);	
			}
		}
		
		return json_encode(array());
	}

	public function  set_enderchest ($uuid = NULL, $json_content = NULL)
	{
		$filename = $uuid.".dat";
		$fullpath = Server::$path."playerdata/$filename";

		shell_exec("sudo -u minecraft chmod g+w $fullpath");

		if (!file_exists($fullpath))
			return FALSE;

		$content = json_decode($json_content,true);

		if (!$content)
			return FALSE;

		$full_content = array (
			"type" => 10,
			"value" => $content
		);

		$nbt = new nbt();
		$nbt->loadFile($fullpath);
		
		// Find array key 
		$key_enderitems = NULL;
		foreach ($nbt->root[0]['value'] as $key => $item)
			if ($item['name'] == "EnderItems")
				$key_enderitems = $key;

		$nbt->root[0]['value'][$key_enderitems]['value'] = $full_content;

		$nbt->writeFile($fullpath);
	}

	/*
	 * Every day for the last week
	 * Every 2 days for the last 3 weeks
	 * All after 3 weeks
	 */
	public function clean_backup ()
	{
		$worlds = scandir(Server::$backup_path);

		foreach ($worlds as $world)
		{
			if ($world == "." or $world == "..")
				continue;

			$name = substr($world,0,10);
			$date = strtotime($name);

			if ($date <= strtotime("-3 weeks") OR
				(
					$date <= strtotime("-1 week") AND
					date("z",$date) %2 == 0
				))
			{
				$cmd = "rm ".Server::$backup_path.$world;
				shell_exec("sudo -u minecraft $cmd");
			}
		}
	}
}

?>

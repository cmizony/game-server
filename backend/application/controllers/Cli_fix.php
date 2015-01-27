<?php if ( ! defined('BASEPATH')) exit('No direct script access allowed');

class Cli_fix extends CI_Controller
{

	public function __construct()
	{
		parent::__construct();
		if (!$this->input->is_cli_request())
			exit;

		$this->load->library('migration');
	}

	public function index ()
	{
		echo "CLI Fix\n";
		echo "\t generate_migration [db_group=NULL] [tables=NULL]\n";
		echo "\t migrate_to <version>\n";
		echo "\t reset_tp_status\n";
	}

	public function reset_tp_status ()
	{
		$this->db->select('name');
		$this->db->from('players');
		$query = $this->db->get();

		foreach ($query->result() as $row)
		{
			$cmd = "cmd scoreboard players set $row->name status 0";
			$this->server->send($cmd);
		}
	}

	public function test()
	{
	}

	public function generate_migration($db_group= NULL,$tables = NULL)
	{
		$this->load->library('VpxMigration');

		if (!is_null($db_group))
			$this->vpxmigration->init_db($db_group);

		$nb_args = func_num_args();
		if ($nb_args > 1)
		{
			$tables = array();
			$arg_list = func_get_args();
			for ($i = 1; $i < $nb_args; $i++)
				array_push($tables,$arg_list[$i]);
		}

		$file = $this->vpxmigration->generate($tables);
		echo $file;
	}

	public function migrate_to ($version)
	{
		$this->migration->version($version);
	}

	public function set_email_tokens ()
	{
		$players = $this->db->get('players');

		$data = array();

		foreach ($players->result() as $player)
		{
			array_push($data,array(
				"uuid" => $player->uuid,
				"token_email" => $this->server->generate_token()
			));
		}

		$this->db->update_batch('players', $data, 'uuid'); 
	}

	public function send_welcome_emails ()
	{
		$players = $this->db->get('players');
		$this->load->library('promotion');

		foreach ($players->result() as $player)
		{
			$this->promotion->email_welcome($player->uuid);
		}
	}

	public function get_enderchest ($name)
	{
		$query = $this->db->get_where('players',array("name" => $name));
		$player = $query->first_row(); 

		$enderchest = $this->server->get_enderchest($player->uuid);

		print_r(json_decode($enderchest));
	}

	public function backup_enderchest ($file)
	{
		$fullpath = "upload/$file";

		if (!file_exists($fullpath))
		{
			echo "File does not exists: $fullpath\n";
			return FALSE;
		}
		$nbt = new nbt();
		$nbt->loadFile($fullpath);

		$nbt_player = $nbt->root[0];
		$enderchest = '';

		foreach ($nbt_player['value'] as $item)
		{
			if ($item['name'] == "EnderItems")
			{
				$ender_items = $item['value']['value'];
				$enderchest = json_encode($ender_items);	
			}
		}

		$this->db->where('name','CobblerGoblyn');
		$this->db->update('players',array('enderchest_backup' => $enderchest));
	}

	public function backup_all_enderchests()
	{
		$players = $this->db->get('players');
		$data = array();

		foreach ($players->result() as $row)
		{
			// Backup enderChest
			$enderchest = $this->server->get_enderchest($row->uuid);

			if (!$enderchest)
				$enderchest = "[]";

			
			array_push($data,array(
				"uuid" => $row->uuid,
				"enderchest_content" => $enderchest,
				"enderchest_backup" => ""
			));
		}

		$this->db->update_batch('players', $data, 'uuid'); 
	}

	public function cleanup_uuid ()
	{
		$fullpath_players = "/opt/msm/servers/hardcore/playerdata/";
		$fullpath_stats = "/opt/msm/servers/hardcore/stats/";

		$player_files = scandir($fullpath_players);
		$stats_files = scandir($fullpath_stats);

		$players = $this->db->get('players');
		$valid_player_files = array(".","..");
		$valid_stats_files = array(".","..");

		foreach ($players->result() as $row)
		{
			array_push($valid_player_files,"$row->uuid.dat");
			array_push($valid_stats_files,"$row->uuid.json");
		}

		$delete_players_files = array_diff($player_files,$valid_player_files);
		$delete_stats_files = array_diff($stats_files,$valid_stats_files);

		foreach ($delete_players_files as $file)
			if (file_exists($fullpath_players.$file))
				shell_exec("sudo -u minecraft rm $fullpath_players$file");

		foreach ($delete_stats_files as $file)
			if (file_exists($fullpath_stats.$file))
				shell_exec("sudo -u minecraft rm $fullpath_stats$file");
	}

	public function force_resuscribe ()
	{
		$players = $this->db->get('players');
		
		foreach ($players->result() as $row)
		{
			$cmd = "cmd whitelist add $row->name";
			echo "$cmd\n";
			$this->server->send($cmd);
		}

	}
}
?>

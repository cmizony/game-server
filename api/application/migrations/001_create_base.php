<?php defined('BASEPATH') OR exit('No direct script access allowed');

class Migration_create_base extends CI_Migration {

	public function up() {

		## Create Table lags
		$this->dbforge->add_field("`id` int(11) NOT NULL auto_increment");
		$this->dbforge->add_key("id",true);
		$this->dbforge->add_field("`date` int(11) NOT NULL ");
		$this->dbforge->add_field("`ms` int(11) NOT NULL ");
		$this->dbforge->add_field("`ticks` int(11) NOT NULL ");
		$this->dbforge->create_table("lags", TRUE);
		$this->db->query('ALTER TABLE  `lags` ENGINE = InnoDB');
		## Create Table logs
		$this->dbforge->add_field("`id` int(11) NOT NULL auto_increment");
		$this->dbforge->add_key("id",true);
		$this->dbforge->add_field("`uuid` varchar(200) NOT NULL ");
		$this->dbforge->add_field("`name` varchar(200) NOT NULL ");
		$this->dbforge->add_field("`game_type` int(11) NOT NULL ");
		$this->dbforge->add_field("`dimension` varchar(100) NOT NULL ");
		$this->dbforge->add_field("`date` int(11) NOT NULL ");
		$this->dbforge->add_field("`actions` text NOT NULL ");
		$this->dbforge->add_field("`inventory` text NOT NULL ");
		$this->dbforge->add_field("`health` int(11) NOT NULL ");
		$this->dbforge->add_field("`xp_level` int(11) NOT NULL ");
		$this->dbforge->add_field("`xp_progress` double NOT NULL ");
		$this->dbforge->add_field("`food_level` int(11) NOT NULL ");
		$this->dbforge->add_field("`x` double NOT NULL ");
		$this->dbforge->add_field("`y` double NOT NULL ");
		$this->dbforge->add_field("`z` double NOT NULL ");
		$this->dbforge->create_table("logs", TRUE);
		$this->db->query('ALTER TABLE  `logs` ENGINE = InnoDB');
		## Create Table migrations
		$this->dbforge->add_field("`version` bigint(20) NOT NULL ");
		$this->dbforge->create_table("migrations", TRUE);
		$this->db->query('ALTER TABLE  `migrations` ENGINE = InnoDB');
		## Create Table players
		$this->dbforge->add_field("`id` int(11) NOT NULL auto_increment");
		$this->dbforge->add_key("id",true);
		$this->dbforge->add_field("`name` varchar(100) NOT NULL ");
		$this->dbforge->add_field("`lives` int(11) NOT NULL ");
		$this->dbforge->add_field("`spawn_kit` int(11) NOT NULL ");
		$this->dbforge->add_field("`token` int(11) NOT NULL ");
		$this->dbforge->add_field("`votes` int(11) NOT NULL ");
		$this->dbforge->add_field("`score` int(11) NOT NULL ");
		$this->dbforge->add_field("`gmail` varchar(200) NOT NULL ");
		$this->dbforge->add_field("`uuid` varchar(200) NOT NULL ");
		$this->dbforge->add_field("`created` int(11) NOT NULL ");
		$this->dbforge->add_field("`verified` int(11) NOT NULL ");
		$this->dbforge->add_field("`last_location` text NOT NULL ");
		$this->dbforge->add_field("`map_access` int(11) NOT NULL ");
		$this->dbforge->add_field("`last_online` int(11) NOT NULL ");
		$this->dbforge->add_field("`enderchest_backup` text NULL ");
		$this->dbforge->add_field("`vip` int(11) NULL ");
		$this->dbforge->add_field("`token_email` int(11) NULL ");
		$this->dbforge->add_field("`token_event` int(11) NULL ");
		$this->dbforge->add_field("`xp_backup` text NULL ");
		$this->dbforge->add_field("`enderchest_content` text NULL ");
		$this->dbforge->add_field("`last_stats` text NULL ");
		$this->dbforge->add_field("`last_inventory` text NULL ");
		$this->dbforge->add_field("`item_reward` varchar(100) NULL ");
		$this->dbforge->create_table("players", TRUE);
		$this->db->query('ALTER TABLE  `players` ENGINE = InnoDB');
		## Create Table rewards
		$this->dbforge->add_field("`id` int(11) NOT NULL auto_increment");
		$this->dbforge->add_key("id",true);
		$this->dbforge->add_field("`uuid` varchar(200) NOT NULL ");
		$this->dbforge->add_field("`token` int(11) NOT NULL ");
		$this->dbforge->add_field("`items` text NOT NULL ");
		$this->dbforge->add_field("`created` int(11) NOT NULL ");
		$this->dbforge->add_field("`used` int(11) NOT NULL ");
		$this->dbforge->add_field("`source` varchar(100) NOT NULL ");
		$this->dbforge->create_table("rewards", TRUE);
		$this->db->query('ALTER TABLE  `rewards` ENGINE = InnoDB');
		## Create Table server
		$this->dbforge->add_field("`name` varchar(200) NOT NULL ");
		$this->dbforge->add_field("`active_players` int(11) NOT NULL ");
		$this->dbforge->add_field("`is_online` int(11) NOT NULL ");
		$this->dbforge->add_field("`worldborder` int(11) NOT NULL ");
		$this->dbforge->add_field("`spawn_x` float NOT NULL ");
		$this->dbforge->add_field("`spawn_y` float NOT NULL ");
		$this->dbforge->add_field("`spawn_z` float NOT NULL ");
		$this->dbforge->add_field("`map_link` varchar(400) NOT NULL ");
		$this->dbforge->add_field("`id` int(11) NOT NULL auto_increment");
		$this->dbforge->add_key("id",true);
		$this->dbforge->create_table("server", TRUE);
		$this->db->query('ALTER TABLE  `server` ENGINE = InnoDB');
		## Create Table structures
		$this->dbforge->add_field("`id` int(11) NOT NULL auto_increment");
		$this->dbforge->add_key("id",true);
		$this->dbforge->add_field("`uuid` varchar(200) NOT NULL ");
		$this->dbforge->add_field("`title` varchar(200) NOT NULL ");
		$this->dbforge->add_field("`date` int(11) NOT NULL ");
		$this->dbforge->add_field("`whitelist` text NOT NULL ");
		$this->dbforge->add_field("`photo` varchar(200) NOT NULL ");
		$this->dbforge->add_field("`radius` int(11) NOT NULL ");
		$this->dbforge->add_field("`x` double NOT NULL ");
		$this->dbforge->add_field("`y` double NOT NULL ");
		$this->dbforge->add_field("`z` double NOT NULL ");
		$this->dbforge->create_table("structures", TRUE);
		$this->db->query('ALTER TABLE  `structures` ENGINE = InnoDB');
	 }

	public function down()	{
		### Drop table lags ##
		$this->dbforge->drop_table("lags", TRUE);
		### Drop table logs ##
		$this->dbforge->drop_table("logs", TRUE);
		### Drop table migrations ##
		$this->dbforge->drop_table("migrations", TRUE);
		### Drop table players ##
		$this->dbforge->drop_table("players", TRUE);
		### Drop table rewards ##
		$this->dbforge->drop_table("rewards", TRUE);
		### Drop table server ##
		$this->dbforge->drop_table("server", TRUE);
		### Drop table structures ##
		$this->dbforge->drop_table("structures", TRUE);

	}
}

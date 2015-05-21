<?php

defined('BASEPATH') OR exit('No direct script access allowed');

require APPPATH.'/libraries/REST_Controller.php';

class Minecraft extends REST_Controller {

	public function index_get ()
	{
		echo "API Minecraft";
	}


	/* Sample returns:
	 * 
	 * {"max":30,"online":1,"sample":[{"id":"ecffec50-124f-46e7-a863-5780213e92fc","name":"Deranged_Monkey"}]}
	 * {"max":5,"online":0}
	 * false
	 */
	public function summary_players_get () 
	{
		// Get Top 3 votes
		$this->db->select('name,votes,uuid');
		$this->db->from('players');
		$this->db->where('votes >',0);
		$this->db->order_by('votes','desc');
		$this->db->order_by('score','desc');
		$this->db->limit('3');
		$query = $this->db->get();

		$top_votes = array();
		foreach ($query->result() as $row)
		{
			$vote_player = new stdClass;
			$vote_player->username = $row->name;
      $vote_player->vote = $row->votes;
      $vote_player->uuid = $row->uuid;
      
			array_push($top_votes,$vote_player);
		}

		// Get Active players
		$this->db->select('name,uuid');
		$this->db->from('logs');
		$this->db->where('date >',strtotime("-2 week"));
		$this->db->group_by('name');
		$this->db->having('count(name) >',240);
		$this->db->order_by('count(name)','desc');
		$query = $this->db->get();

		$active_players = array();
    foreach ($query->result() as $row)
    {
			$active_player = new stdClass;
			$active_player->username = $row->name;
      $active_player->uuid = $row->uuid;
      array_push($active_players,$active_player);
    }

		// Get Players online
		$players = $this->server->get_players(); 

		if (!$players)
		{
			$this->response(array(
				'error' => 'Server Offline',
				'top_votes' => $top_votes,
				'active_players' => $active_players
			), 200);
			return false;
		}
		
		$players['top_votes'] = $top_votes;
		$players['active_players'] = $active_players;
		$this->response($players, 200);
	}

	public function summary_donations_get () 
	{
		$top_donations = array();

		$top_daily_donator = $this->server->top_tips_from(strtotime("today 5AM",strtotime("-5 hour")));
		$top_weekly_donator = $this->server->top_tips_from(strtotime('last monday 4AM', strtotime('tomorrow')));
		$sum_total_donations = $this->server->sum_tips_from(strtotime('January 2014'));

		$top_donations['top_daily'] = $top_daily_donator;
		$top_donations['top_weekly'] = $top_weekly_donator;
		$top_donations['sum_total'] = $sum_total_donations;

		$this->response($top_donations, 200); 
	}

	public function player_get($player_uuid = NULL)
	{

		$this->db->select('name,uuid,created,lives,votes,score,last_online,enderchest_content');
		$this->db->from('players');
		$this->db->where('uuid',$player_uuid);
		$query = $this->db->get();

		if ($query->num_rows() == 0)
		{
			$this->response(array('error' => 'Couldn\'t find this player'), 404);
		}

		$player_result = $query->result_array();
		$player = array_shift($player_result);

		//Get stats
		$player['stats'] = $this->server->get_stats($player_uuid); //TODO get stats player_get from db last update

		$this->db->select('items,created,source');
		$this->db->from('rewards');
		$this->db->where('uuid',$player_uuid);
		$this->db->where('used',1);
		
		$query = $this->db->get();
		
		$rewards = $query->result_array();

		$player['rewards'] = $rewards;

		$this->response($player, 200); // 200 being the HTTP response code
	}

	public function players_get ()
	{
		$this->db->select('name,uuid,lives,votes,score,created,last_online,enderchest_content');
		$this->db->from('players');
		$query = $this->db->get();
		
		$players = $query->result_array();
		$this->response($players, 200); // 200 being the HTTP response code
	}

	/*
	 * Expecting:
	 * {"token":"1234","uuid":"ec59-d5"}
	 *
	 */
	public function vote_post ()
	{
		$request = file_get_contents('php://input');
		$parameters = json_decode($request);

		// Check Parameters
		if (is_null($parameters) OR
			!property_exists($parameters,"token") OR
			!property_exists($parameters,"uuid"))
		{
			$this->response(array('error' => 'Invalid parameters'), 200);
			return false;
		}


		// Check token
		$this->db->select('uuid,token');
		$this->db->from('players');
		$this->db->where('token', $parameters->token);
		$this->db->where('token <>',0);

		$query = $this->db->get();

		if ($query->num_rows() == 0)
		{
			$this->response(array('error' => 'Token not valid'), 200);
			return false;
		}

		// Check if in top 3
		/* 
		 * Rule Temporarely suspended
		 *
		$this->db->select('uuid,token');
		$this->db->from('players');
		$this->db->where('votes >',0);
		$this->db->order_by('votes','desc');
		$this->db->order_by('score','desc');
		$this->db->limit('3');
		$query = $this->db->get();

		foreach ($query->result() as $row)
		{
			if ($row->token == $parameters->token AND
				$row->uuid == $parameters->uuid)
			{
				$this->response(array('error' => 'You can not vote for yourself if you are already in the top 3'), 200);
				return false;
			}
		}
		 */

		// Check name
		$this->db->select('name,uuid,votes');
		$this->db->from('players');
		$this->db->where('uuid', $parameters->uuid);
		$query = $this->db->get();

		if ($query->num_rows() == 0)
		{
			$this->response(array('error' => 'Name not valid'), 200);
			return false;
		}
		$player_target = $query->row();

		// Create reward

		$vote_rewards = $this->config->item('vote_rewards');
		$item_reward = '';

		if (!empty($vote_rewards))
		{
			$key = rand(0,count($vote_rewards)-1);
			$item_reward = $vote_rewards[$key];
		}

		// Add vote to target player
		$data = array("votes" => ($player_target->votes + 1));

		$this->db->where('uuid', $parameters->uuid);
		$this->db->update('players', $data);

		// Add reward to source player


		// Reset token & add reward to source player
		$data = array(
			"token" => 0,
			"item_reward" => $item_reward
		);

		$this->db->where('token', $parameters->token);
		$this->db->update('players', $data);

		$response = array(
			'success' => "Vote to $player_target->name saved",
			'item_reward' => $item_reward
		);

		$this->response($response, 200);
	}

	/*
	 * Expecting:
	 * {"name":"example","email":"example@email.com"}
	 *
	 */
	public function player_post ()
	{

		$request = file_get_contents('php://input');
		$parameters = json_decode($request);

		// Check Parameters
		if (is_null($parameters) OR
			!property_exists($parameters,"name") OR
			!property_exists($parameters,"email"))
		{
			$this->response(array('error' => 'Invalid parameters'), 200);
			return false;
		}

		// Check UUID exists - Mojang
		$mojang_player = $this->server->get_uuid($parameters->name);
		if (!$mojang_player)
		{
			$this->response(array('error' => 'Invalid minecraft name'), 200);
			return false;
		}

		// Add "-" in uuid
		$formated_uuid = substr_replace($mojang_player->id,"-",8,0);
		$formated_uuid = substr_replace($formated_uuid,"-",13,0);
		$formated_uuid = substr_replace($formated_uuid,"-",18,0);
		$formated_uuid = substr_replace($formated_uuid,"-",23,0);

		// Check UUID exists - whitelist
		if ($this->server->is_whitelisted($formated_uuid))
		{
			$this->response(array('error' => 'Already on the whitelist'), 200);
			return false;
		}	

		// Check UUID exisits - database
		$this->db->select('uuid');
		$this->db->from('players');
		$this->db->where('uuid', $formated_uuid);
		$query = $this->db->get();

		if ($query->num_rows() > 0)
		{
			$this->response(array('error' => 'Already in the database'), 200);
			return false;
		}

		// Add in database

		$player = array (
			"name" => $mojang_player->name,
			"lives" => 2,
			"token" => 0,
			"token_email" => $this->server->generate_token(),
			"votes" => 0,
			"score" => 0,
			"spawn_kit" => 0,
			"gmail" => $parameters->email,
			"uuid" => $formated_uuid,
			"created" => strtotime("now"),
			"verified" => 0,
			"last_online" => 0,
			"map_access" => 0
		);

		$this->db->insert('players', $player);

		// Send welcome email
		$this->load->library('promotion');
		$this->promotion->email_welcome($formated_uuid); 

		// Set status to tp spawn
		$cmd = "cmd scoreboard players set $mojang_player->name status 0";
		$this->server->send($cmd);

		// Add in white-list
		$cmd = "cmd whitelist add $mojang_player->name";
		$this->server->send($cmd);

		$this->response(array('success' => 'User added'), 200);
	}

	public function reward_post()
	{
		$request = file_get_contents('php://input');
		$parameters = json_decode($request);

		// Check Parameters

		if (is_null($parameters) OR
			!property_exists($parameters,"token"))
		{
			$this->response(array('error' => 'Invalid parameters'), 200);
			return false;
		}


		$this->db->select('rewards.*,players.name');
		$this->db->from('rewards');
		$this->db->join('players','rewards.uuid = players.uuid');
		$this->db->where('rewards.token', intval($parameters->token),false);
		$query = $this->db->get();

		// Check Duplicate Token

		if ($query->num_rows() > 1)
		{
			$this->response(array('error' => 'Duplicate Token. Please contact admin on the forum or in-game'), 200);
			return false;
		}


		// Check Token

		if ($query->num_rows() == 0)
		{
			$this->response(array('error' => 'Reward token not valid'), 200);
			return false;
		}

		// Check Used
		$row = $query->first_row();

		if ($row->used > 0)
		{
			$this->response(array('error' => 'Reward already used'), 200);
			return false;
		}
 

		// Check offline
		$online_players = $this->server->get_players(); // TODO review
		$online_players = $online_players['sample'];

		foreach ($online_players as $player)
		{
			if (strcasecmp($player['name'],$row->name) == 0)
			{
				$this->response(array('error' => 'You need to be log out of the minecraft server'), 200);
				return false;
			}
		}
		
		// Check if empty reward items

		$rewards_items = json_decode($row->items);
		if (empty($rewards_items))
		{
			$this->response(array('error' => 'Error when generating items, please report on forum'), 200);
			return false;
		}

		// Check enderchest full (27 - 9)

		$enderchest = json_decode($this->server->get_enderchest($row->uuid));
		if (count($enderchest) > (27 - count($rewards_items)))
		{
			$this->response(array('error' => 'Your Ender-chest need '.count($rewards_items).' free slots'), 200);
			return false;
		}

		$this->load->helper('minecraft');
		$new_enderchest = fill_chest($enderchest,$rewards_items);
		$this->server->set_enderchest($row->uuid,json_encode($new_enderchest));

		// Update player enderchest content
		$data = array('enderchest_content' => json_encode($new_enderchest));
		$this->db->where('uuid', $row->uuid);
		$this->db->update('players', $data);

		// Update player reward to used
		
		$data = array('used' => 1);
		$this->db->where('token', $parameters->token);
		$this->db->update('rewards', $data);
	 
		// Return reward items
		
		$this->response(array(
			'success' => "Reward items added in your enderchest",
			'items' => $rewards_items
		), 200);
	}

	public function structures_get ()
	{
		$this->load->helper('url');

		$this->db->select('title,date,radius,photo,x,y,z');
		$this->db->from('structures');
		$query = $this->db->get();
		
		$structures = $query->result_array();

		foreach ($structures as &$structure)
		{
			$structure['thumbnail'] = base_url("assets/structures/thumbnail_".$structure['photo']);
			$structure['photo'] = base_url("assets/structures/".$structure['photo']);
		}

		$this->response($structures, 200); 
	}

	public function latest_logs_get ()
	{
		$this->db->select_max('date');
		$this->db->from('logs');
		$query = $this->db->get();

		$log = $query->first_row();

		// Not Log in database
		if ($query->num_rows() == 0)
		{
			$this->response(array(), 404);
			return FALSE;
		}

		$latest_time = $log->date;

		// No log for more than 5 minutes
		if (strtotime("-5 minutes") > $latest_time)
		{
			$this->response(array(), 404);
			return FALSE;
		}

		$this->db->select("name,date,actions,health,xp_level,xp_progress,food_level,x,y,z");
		$this->db->from('logs');
		$this->db->where('date',$latest_time);
		$this->db->where('dimension','Overworld');
		$this->db->where('game_type',0);
		$query = $this->db->get();

		$logs = $query->result_array();
		$this->response($logs, 200); 
	}

	public function explored_biomes_get ()
	{
		$explored_biomes = $this->server->explored_biomes();

		$this->response($explored_biomes, 200); 
	}

	public function advance_search_get ($start_time = NULL)
	{
		// TODO add mem cache

		if (is_null($start_time))
			$start_time = strtotime(date('Y-m-d 00:00:00'));
		else
			$start_time = strtotime($start_time);

		// Only give one day of data each time
		$end_time = strtotime(date('Y-m-d',$start_time)." 23:59:59");

		// Get Player logs
		$this->db->select("name,date,actions,inventory");
		$this->db->from('logs');
		$this->db->where('date >=',$start_time);
		$this->db->where('date <=',$end_time);
		$query = $this->db->get();
		$logs = $query->result_array();

		// Get Server lags
		$this->db->select("date,ms,ticks",FALSE);
		$this->db->from('lags');
		$this->db->where('date >=',$start_time);
		$this->db->where('date <=',$end_time);
		$query = $this->db->get();
		$lags = $query->result_array();

		$response = array (
			"logs" => $logs,
			"lags" => $lags
		);

		$this->response($response, 200); 
	}
}

?>

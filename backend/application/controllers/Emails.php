<?php

defined('BASEPATH') OR exit('No direct script access allowed');

class Emails extends CI_Controller 
{

	public function __construct ()
	{
		parent::__construct();

		$this->load->helper("url");
	}

	public function index () 
	{
		show_404();
	}

	public function send_test ()
	{
		if (!$this->input->is_cli_request())
			show_404();

		$this->load->library('promotion');
		$this->promotion->email_reward("a2de459d-f84a-4475-866b-80fa869b0321",5605);
	}

	public function send_template ()
	{
		if (!$this->input->is_cli_request())
			show_404();

		$this->load->library('promotion');
		$this->promotion->email_template("huitbplus@gmail.com");
	}

	public function template ()
	{
		$this->load->view("email_template.php");
	}

	public function structure ($id = NULL, $visitor = NULL)
	{
		$this->db->select('structures.id,name,title,photo');
		$this->db->from('structures');
		$this->db->where('id',$id);
		$this->db->join('players', 'players.uuid = structures.uuid');
		$query = $this->db->get();

		if ($query->num_rows () == 0)
			return FALSE;

		$structure = $query->first_row();

		$data = array (
			"structure" => $structure,
			"visitor" => $visitor,
		);

		$this->load->view("email_structure",$data);
	}

	public function map ($name = "")
	{
		$map_link = $this->config->item('map_link');

		$data = array(
			"name" => $name,
			"map_link" => $map_link
		);

		$this->load->view("email_map.php",$data);
	}

	public function life ($name = "")
	{
		$data = array(
			"name" => $name
		);
		$this->load->view("email_life.php",$data);
	}

	public function verify ($token = "")
	{
		$this->load->helper('security');

		$query = $this->db->get('players');
		$player = NULL;

		foreach ($query->result() as $row)
			if (encode_string($row->uuid) == $token)
				$player = $row;

		if (is_null($player))
		{
			redirect("http://huitaplus.com");
		}
		else
		{
			// Unban if needed
			$banlist_path = Server::$path."banned-players.json";
			$banlist = file_get_contents($banlist_path);
			$ban_players = json_decode($banlist);

			foreach ($ban_players as $ban_player)
			{
				if ($ban_player->uuid == $player->uuid AND
					$ban_player->reason == "Please verify your email address to be pardon. Check your inbox")
				{
					$this->server->unban($player->uuid, $player->name);
				}
			}

			// Verify email
			$data = array (
				"verified" => 1,
			);

			$this->db->where('uuid', $player->uuid);
			$this->db->update('players', $data);

			redirect("http://huitaplus.com");
		}
	}

	public function welcome($id = "")
	{
		$this->load->helper('security');

		$query = $this->db->get('players');
		$player = NULL;

		foreach ($query->result() as $row)
			if (encode_string($row->uuid) == $id)
				$player = $row;

		if (is_null($player))
			show_404();

		$data = array (
			"name" => $player->name,
			"id" => $id,
			"token" => encode_string($player->uuid)
		);

		$this->load->view("email_welcome.php",$data);
	}

	public function reward ($id = "")
	{
		$this->load->helper('security');

		$query = $this->db->get('rewards');
		$reward = NULL;

		foreach ($query->result() as $row)
			if (encode_string($row->token) == $id)
				$reward = $row;

		if (is_null($reward))
			show_404();

		$data = array (
			"id" => $id,
			"token" => $row->token,
		);

		$this->load->view("email_reward.php",$data);
	}
}

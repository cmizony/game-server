<?php
defined('BASEPATH') OR exit('No direct script access allowed');

class Promotion {

	/*
	 * Require sendmail installed
	 */

	protected $CI;

	public function __construct ()
	{
		$this->CI =& get_instance();
		$this->CI->load->library('email');
		$this->CI->load->helper("url");

		$config = array (
			'mailtype' => 'html',
			'validate' => true
		);
		$this->CI->email->initialize($config);
	}

	public function email_template ($to)
	{
		$this->CI->email->from('noreply@huitaplus.com', 'Minecraft Huitaplus');
		$this->CI->email->to($to); 
		$this->CI->email->bcc('huitbplus@gmail.com'); 

		$content = $this->CI->load->view("email_template.php",'',TRUE);

		$this->CI->email->subject('[Minecraft] Template email');
		$this->CI->email->message($content);

		$this->CI->email->send();
	}

	public function email_map ($to,$name)
	{
		$this->CI->email->from('noreply@huitaplus.com', 'Minecraft Huitaplus');
		$this->CI->email->to($to); 
		$this->CI->email->bcc('huitbplus@gmail.com'); 

		$map_link = $this->CI->config->item('map_link');

		$data = array(
			"name" => $name,
			"map_link" => $map_link
		);

		$content = $this->CI->load->view("email_map.php",$data,TRUE);

		$this->CI->email->subject("[Minecraft] $name you now have access to the map!");
		$this->CI->email->message($content);

		$this->CI->email->send();
	}

	public function email_life ($to,$name)
	{
		$this->CI->email->from('noreply@huitaplus.com', 'Minecraft Huitaplus');
		$this->CI->email->to($to); 
		$this->CI->email->bcc('huitbplus@gmail.com'); 

		$data = array(
			"name" => $name
		);

		$content = $this->CI->load->view("email_life.php",$data,TRUE);

		$this->CI->email->subject('[Minecraft] You got resurrected!');
		$this->CI->email->message($content);

		$this->CI->email->send();
	}

	public function email_reward ($uuid,$token)
	{
		$this->CI->load->helper('security');
		
		$query = $this->CI->db->get_where('players',array("uuid"=>$uuid));

		if ($query->num_rows () == 0)
			return FALSE;

		$this->CI->load->helper('security');

		$player = $query->first_row();

		$data = array (
			"token" => $token,
			"id" => encode_string($token),
		);

		$content = $this->CI->load->view("email_reward.php",$data,TRUE);
		
		$this->CI->email->from('noreply@huitaplus.com', 'Minecraft Huitaplus');
		$this->CI->email->to($player->gmail); 
		$this->CI->email->bcc('huitbplus@gmail.com'); 
		$this->CI->email->subject("[Minecraft] $player->name, You got a package of items");
		$this->CI->email->message($content);

		$this->CI->email->send();
	}

	public function email_structure ($id,$visitor)
	{
		$this->CI->db->select('structures.id,name,gmail,title,photo');
		$this->CI->db->from('structures');
		$this->CI->db->where('structures.id',$id);
		$this->CI->db->join('players', 'players.uuid = structures.uuid');
		$query = $this->CI->db->get();

		if ($query->num_rows () == 0)
			return FALSE;

		$structure = $query->first_row();

		$data = array (
			"structure" => $structure,
			"visitor" => $visitor
		);

		$content = $this->CI->load->view("email_structure",$data,TRUE);

		$this->CI->email->from('noreply@huitaplus.com', 'Minecraft Huitaplus');
		$this->CI->email->to($structure->gmail); 
		$this->CI->email->bcc('huitbplus@gmail.com'); 
		$this->CI->email->subject("[Minecraft] $visitor came to $structure->title");
		$this->CI->email->message($content);

		$this->CI->email->send();

	}
	public function email_welcome ($uuid)
	{
		// Identify player
		$query = $this->CI->db->get_where('players',array("uuid"=>$uuid));

		if ($query->num_rows () == 0)
			return FALSE;

		$this->CI->load->helper('security');

		$player = $query->first_row();
		$id = encode_string($player->uuid);

		$data = array (
			"name" => $player->name,
			"id" => $id,
			"token" => encode_string($uuid)
		);

		$content = $this->CI->load->view("email_welcome",$data,TRUE);

		$this->CI->email->from('noreply@huitaplus.com', 'Minecraft Huitaplus');
		$this->CI->email->to($player->gmail); 
		$this->CI->email->bcc('huitbplus@gmail.com'); 
		$this->CI->email->subject("[Minecraft] Welcome $player->name to Huitaplus server");
		$this->CI->email->message($content);

		$this->CI->email->send();

	}


}

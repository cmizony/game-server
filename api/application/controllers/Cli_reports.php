<?php if ( ! defined('BASEPATH')) exit('No direct script access allowed');

class Cli_reports extends CI_Controller
{
	public function __construct()
	{
		parent::__construct();
		if (!$this->input->is_cli_request())
			exit;
	}

	/**********************
	 * Crontab example
	 *
	 *	0,15,30,45,55 * * * * cd /var/www/html/app ; php index.php cli_reports collect_lags
	 *	
	 */
	public function index ()
	{
		echo "CLI Reports\n";
		echo "\t collect_lags\n";
	}

	// Every 5 or 10 minutes
	public function collect_lags ()
   	{
		// Get Latest lag in db
		$latest_date = strtotime("today");

		$this->db->select_max('date');
		$this->db->from('lags');
		$query = $this->db->get();
		$latest_lag = $query->first_row();

		if ($query->num_rows() > 0)
			$latest_date = $latest_lag->date;

		// Filter new lags
		
		$lags = $this->server->get_latest_lag();
		$new_lags = array();

		foreach ($lags as $lag)
			if ($lag['date'] > $latest_date &&
				$lag['date'] <= time())
				array_push($new_lags,$lag);

		if (!empty($new_lags))
			$this->db->insert_batch('lags', $new_lags); 
	}
}

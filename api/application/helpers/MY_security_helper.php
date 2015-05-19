<?php
defined('BASEPATH') OR exit('No direct script access allowed');

if (!function_exists('encode_string'))
{
	define('PREFIX_SALT','3548add3aa99038043ed051e910d2a39');
	define('SUFFIX_SALT','aa0bab390ff3955575c31e5ff5af749a');

	function encode_string ($uuid)
	{
		return hash("sha1",PREFIX_SALT.$uuid.SUFFIX_SALT);
		
	}
}

<?php
defined('BASEPATH') OR exit('No direct script access allowed');

if (!function_exists('distance_3d'))
{
	function distance_3d ($point_a,$point_b)
	{
		if (!$point_a OR !$point_b)
			return false;

		if (is_array($point_a))
			$point_a = json_decode(json_encode($point_a),FALSE);

		if (is_array($point_b))
			$point_b = json_decode(json_encode($point_b),FALSE);

		$distance = sqrt(
			pow($point_a->x - $point_b->x,2) +
			pow($point_a->y - $point_b->y,2) +
			pow($point_a->z - $point_b->z,2)
		);

		return $distance;
	}
}

if (!function_exists('parse_inventory'))
{
	function parse_inventory ($json_inventory)
	{
		$raw_inventory = json_decode($json_inventory);

		if (!$raw_inventory)
			return array();

		$raw_inventory = (array)$raw_inventory;
		$raw_inventory = $raw_inventory['value'];

		// Create inventory
		$inventory = array();
		foreach ($raw_inventory as $item)
		{
			$id = "undefined";
			$count = 0;
			$meta = 0;
			foreach ($item as $key)
			{
				if ($key->name == "id")
					$id = str_replace("minecraft:","",$key->value);
				if ($key->name == "Count")
					$count = $key->value;
				if ($key->name == "Damage")
					$meta = $key->value;
			}

			$id = "$id $meta";

			if (!isset($inventory[$id]))
				$inventory[$id] = 0;

			$inventory[$id] += $count;
		}

		return $inventory;
	}
}

if (!function_exists('diff_inventory'))
{
	function diff_inventory ($json_old,$json_new)
	{
		$last_inventory = parse_inventory($json_old);
		$inventory = parse_inventory($json_new);

		$diff_inventory = array_diff_assoc($last_inventory,$inventory);

		$items = array();
		foreach ($diff_inventory as $key => $value)
		{
			$last_value = isset($last_inventory[$key]) ? $last_inventory[$key] : 0;
			$new_value = isset($inventory[$key]) ? $inventory[$key] : 0;

			$items[$key] = $new_value - $last_value;
		}

		return $items;
	}
}

if (!function_exists('fill_chest'))
{
	function fill_chest ($chest,$new_items)
	{
		$free_slots = range(0,26);
		foreach ($chest as $item)
		{
			foreach ($item as $property)
			{
				if ($property->name == "Slot")
				{
					$free_slots = array_diff($free_slots,array($property->value));
				}
			}
		}

		// Set items slot for new items
		
		foreach ($new_items as $item)
		{	
			foreach ($item as $property)
			{
				if ($property->name == "Slot" AND
					!empty($free_slots))
				{
					$property->value = array_pop($free_slots);
				}
			}
		}

		return array_merge($chest,$new_items);

	}
}

<?php

/*
 * Config file for minecraft settings
 *
 */

// Dependency on overviewer config.py
$config['map_link'] = '12345';

// Players max lives in game
$config['max_lives'] = 10;

// StreamTip API
$config['streamtip_client'] = '';
$config['streamtip_token'] = '';

$config['spawn_location'] = array(
	"x" => 0,
	"y" => 101,
	"z" => 0);

$config['spawn_radius'] = 50;

// <name> <count> <meta>
$config['starter_kit'] = array(
	'minecraft:chainmail_helmet 1',
	'minecraft:chainmail_chestplate 1',
	'minecraft:chainmail_leggings 1',
	'minecraft:chainmail_boots 1',
	'minecraft:iron_pickaxe 1',
	'minecraft:log 10',
	'minecraft:coal 20',
	'minecraft:bread 20',
);

// Item that are tested to know if you get new life
// Id = name meta
$config['starter_kit_life'] = array(
	'chainmail_helmet 0',
	'chainmail_chestplate 0',
	'chainmail_leggings 0',
	'chainmail_boots 0'
);

// Item possibles for vote rewards
// <name> <count> <meta>
$config['vote_rewards'] = array(
	'minecraft:yellow_flower 3', 'minecraft:red_flower 3 0',
	'minecraft:red_flower 3 1', 'minecraft:red_flower 3 2',
	'minecraft:red_flower 3 3', 'minecraft:red_flower 3 4',
	'minecraft:red_flower 3 5', 'minecraft:red_flower 3 6',
	'minecraft:red_flower 3 7', 'minecraft:red_flower 3 8',
	'minecraft:double_plant 3', 'minecraft:double_plant 3 1',
	'minecraft:double_plant 3 2', 'minecraft:double_plant 3 3',
	'minecraft:double_plant 3 4', 'minecraft:double_plant 3 5',

	'minecraft:apple 3', 'minecraft:mushroom_stew 3',
	'minecraft:bread 3', 'minecraft:pumpkin_pie 3',
	'minecraft:carrot 3', 'minecraft:baked_potato 3',
	'minecraft:golden_carrot 1', 'minecraft:golden_apple 1',
	'minecraft:golden_apple 1 1', 'minecraft:cooked_beef 3',
	'minecraft:cooked_porkshop 3', 'minecraft:cooked_mutton 3',
	'minecraft:cooked_chicken 3', 'minecraft:rotten_flesh 3',
	'minecraft:melon 3', 'minecraft:cookie 3',
	'minecraft:cake 3', 
	'minecraft:cooked_fished 3', 'minecraft:cooked_fished 3 1',
	'minecraft:cooked_fished 3 2', 'minecraft:cooked_fished 3 3',
	'minecraft:cooked_rabbit 3', 'minecraft:rabbit_stew 3'
);

$config['achievements_points'] = array (
	"openInventory" => 10, 
	"mineWood" => 10,
	"buildWorkBench" => 10,
	"buildPickaxe" => 10,
	"buildHoe" => 10,
	"buildSword" => 10,
	"buildFurnace" => 20,
	"acquireIron" => 20,
	"buildBetterPickaxe" => 20,
	"killCow" => 20,
	"makeBread" => 20,
	"killCow" => 20,
	"makeBread" => 20,
	"killEnemy" => 40,
	"cookFish" => 40,
	"breedCow" => 40,
	"bakeCake" => 80,
	"flyPig" => 80,
	"diamonds" => 80,
	"onARail" => 80,
	"overpowered" => 80,
	"diamondsToYou" => 100,
	"enchantments" => 100,
	"bookcase" => 100,
	"portal" => 100,
	"snipeSkeleton" => 200,
	"ghast" => 200,
	"blazeRod" => 200,
	"potion" => 200,
	"overkill" => 200,
	"theEnd" => 400,
	"theEnd2" => 400,
	"exploreAllBiomes" => 400,
	"spawnWither" => 1000,
	"killWither" => 1000,
	"fullBeacon" => 1000,
);

$config['announcements'] = array (
	'top_donators',
	'top_votes',
	'Use the players data analyzer tool on the website to report grief and lags',
	'Please after voting for players vote also for the server',
	'To own structures get notified when player come and protect your area visit the website',
	'Constructions which cause server lag are punished by ban',
	'Your score lead to item rewards package every 1000 points',
	'Detailed live map available on the website once you have discover all explored biomes',
	'Additional lives are given daily and weekly based on top votes and donations'
);

?>

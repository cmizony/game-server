function split_time (a)
{
	var hours=Math.floor(a/3600); 
	var minutes=Math.floor(a/60)-(hours*60); 

	var hs=' hour';var ms=' minute';
	if (hours!=1) {hs+='s'} 
	if (minutes!=1) {ms+='s'} 

	return hours+hs+', '+minutes+ms;
}

function create_dom_biomes (data)
{
	var dom_biomes = "";

	for (var i=0 ; i < data.length ; i++)
	{
		var biome = data[i];

		// Create & close row tag
		if (i%4 == 0)
		{
			if (i != 0)
				dom_biomes +='</div>';
			dom_biomes +='<div class="row">';
		}

		dom_biomes += '<p class="col-md-3"><i class="fa text-success fa-check-square-o"></i> '+biome+'</p>';
	}

	if (data.length % 4 != 0)
		dom_biomes +='</div>';

	return dom_biomes;
}

function fill_background () 
{
	var max_width = $("body").outerWidth();
	var max_height = $("body").outerHeight();

	div = $(".background-decorative-image").remove();

	var images = [
		{ url:"images/texture_1.png", width:239, height:243},
		{ url:"images/texture_2.png", width:282, height:122},
		{ url:"images/texture_3.png", width:96, height:215},
		{ url:"images/texture_4.png", width:250, height:247},
		{ url:"images/texture_5.png", width:201, height:217},
		{ url:"images/texture_6.png", width:75, height:155},
		{ url:"images/texture_7.png", width:160, height:253},
	];
	
	var max_img_width = 282;
	var max_img_height = 253;
	var header_height = 500;
	var footer_height = 239;

	var occupied = 1;
	var max_images = 10;

	while ( ((occupied*1.0) / (max_width*max_height) < 0.07) && max_images > 0 )
	{
		var index = Math.floor((Math.random() * images.length) + 0);
		var background = images[index];

		var bg_left = Math.floor((Math.random() * (max_width - max_img_width)) + 0);
		var bg_top = Math.floor((Math.random() * (max_height - max_img_height - footer_height - header_height)) + 0);

		var div = $("<div class=\"background-decorative-image\">");
		div.width(background.width+"px");
		div.height(background.height+"px");

		div.css("background-image","url("+background.url+")");
		div.css("position","absolute");
		div.css("left",bg_left+"px");
		div.css("top",(header_height+bg_top)+"px");
		div.css("z-index","-1");
		div.css("background-repeat","no-repeat");

		$("body").append(div);

		occupied += background.width * background.height;
		max_images --;
	}
}

function format_timestamp (timestamp) 
{
	var date = new Date(timestamp*1000);
	var string = date.toDateString();
	
	return string.substr(4,string.length);
}

function calculate_score (difficulty,value)
{
	var score = 0;
	difficulty = parseInt(difficulty);
	value = parseInt(value);

	while (value > 0 && difficulty > 0)
	{
		score += difficulty;
		difficulty = difficulty / 2;
		value --;
	}

	return Math.round(score);
}

function get_achievements ()
{
	return [
	{"icon":"Grid_Book.png","achievement":"Taking Inventory","description":"Open your inventory","difficulty":"10","id":"openInventory"},
	{"icon":"Grid_Oak_Wood.png","achievement":"Getting Wood","description":"Attack a tree until a block of wood pops out","difficulty":"10","id":"mineWood"},
	{"icon":"Grid_Crafting_Table.png","achievement":"Benchmarking","description":"Craft a workbench with four blocks of planks","difficulty":"10","id":"buildWorkBench"},
	{"icon":"Grid_Wooden_Pickaxe.png","achievement":"Time to Mine!","description":"Use planks and sticks to make a pickaxe","difficulty":"10","id":"buildPickaxe"},
	{"icon":"Grid_Wooden_Hoe.png","achievement":"Time to Farm!","description":"Use planks and sticks to make a hoe","difficulty":"10","id":"buildHoe"},
	{"icon":"Grid_Wooden_Sword.png","achievement":"Time to Strike!","description":"Use planks and sticks to make a sword","difficulty":"10","id":"buildSword"},

	{"icon":"Grid_Furnace.png","achievement":"Hot Topic","description":"Construct a furnace out of eight stone blocks","difficulty":"20","id":"buildFurnace"},
	{"icon":"Grid_Iron_Ingot.png","achievement":"Acquire Hardware","description":"Smelt an iron ingot","difficulty":"20","id":"acquireIron"},
	{"icon":"Grid_Stone_Pickaxe.png","achievement":"Getting an Upgrade","description":"Construct a better pickaxe","difficulty":"20","id":"buildBetterPickaxe"},
	{"icon":"Grid_Leather.png","achievement":"Cow Tipper","description":"Harvest some leather","difficulty":"20","id":"killCow"},
	{"icon":"Grid_Bread.png","achievement":"Bake Bread","description":"Turn wheat into bread","difficulty":"20","id":"makeBread"},

	{"icon":"Grid_Bone.png","achievement":"Monster Hunter","description":"Attack and destroy a monster","difficulty":"40","id":"killEnemy"},
	{"icon":"Grid_Cooked_Fish.png","achievement":"Delicious Fish","description":"Catch and cook a fish!","difficulty":"40","id":"cookFish"},
	{"icon":"Grid_Wheat.png","achievement":"Repopulation","description":"Breed two cows with wheat","difficulty":"40","id":"breedCow"},

	{"icon":"Grid_Cake.png","achievement":"The Lie","description":"Bake cake using wheat, sugar, milk, and eggs!","difficulty":"80","id":"bakeCake"},
	{"icon":"Grid_Saddle.png","achievement":"When Pigs Fly","description":"Fly a pig off a cliff","difficulty":"80","id":"flyPig"},
	{"icon":"Grid_Diamond_Ore.png","achievement":"DIAMONDS!","description":"Acquire diamonds with your iron tools","difficulty":"80","id":"diamonds"},
	{"icon":"Grid_Rail.png","achievement":"On A Rail","description":"Travel by minecart at least 1 km from where you started","difficulty":"80","id":"onARail"},
	{"icon":"Grid_Golden_Apple.png","achievement":"Overpowered","description":"Build a Notch apple","difficulty":"80","id":"overpowered"},

	{"icon":"Grid_Diamond.png","achievement":"Diamonds to you!","description":"Throw diamonds at another player.","difficulty":"100","id":"diamondsToYou"},
	{"icon":"Grid_Enchantment_Table.png","achievement":"Enchanter","description":"Use a book, obsidian and diamonds to construct an enchantment table","difficulty":"100","id":"enchantments"},
	{"icon":"Grid_Bookshelf.png","achievement":"Librarian","description":"Build some bookshelves to improve your enchantment table","difficulty":"100","id":"bookcase"},
	{"icon":"Grid_Obsidian.png","achievement":"We Need to Go Deeper","description":"Build a portal to the Nether","difficulty":"100","id":"portal"},

	{"icon":"Grid_Bow.png","achievement":"Sniper Duel","description":"Kill a skeleton with an arrow from more than 50 meters","difficulty":"200","id":"snipeSkeleton"},
	{"icon":"Grid_Ghast_Tear.png","achievement":"Return to Sender","description":"Destroy a Ghast with a fireball","difficulty":"200","id":"ghast"},
	{"icon":"Grid_Blaze_Rod.png","achievement":"Into Fire","description":"Relieve a Blaze of its rod","difficulty":"200","id":"blazeRod"},
	{"icon":"Grid_Mundane_Potion.png","achievement":"Local Brewery","description":"Brew a potion","difficulty":"200","id":"potion"},
	{"icon":"Grid_Diamond_Sword.png","achievement":"Overkill","description":"Deal nine hearts of damage in a single hit","difficulty":"200","id":"overkill"},

	{"icon":"Grid_Eye_of_Ender.png","achievement":"The End?","description":"Locate the End","difficulty":"400","id":"theEnd"},
	{"icon":"Grid_Dragon_Egg.png","achievement":"The End.","description":"Defeat the Ender Dragon","difficulty":"400","id":"theEnd2"},
	{"icon":"Grid_Diamond_Boots.png","achievement":"Adventuring Time","description":"Discover all biomes","difficulty":"400","id":"exploreAllBiomes"},

	{"icon":"Grid_Wither_Skeleton_Skull.png","achievement":"The Beginning?","description":"Spawn the Wither","difficulty":"1000","id":"spawnWither"},
	{"icon":"Grid_Nether_Star.png","achievement":"The Beginning.","description":"Kill the Wither","difficulty":"1000","id":"killWither"},
	{"icon":"Grid_Beacon.png","achievement":"Beaconator","description":"Create a full beacon","difficulty":"1000","id":"fullBeacon"},
	];
}

function create_cookie(name,value,days) {
	if (days) {
		var date = new Date();
		date.setTime(date.getTime()+(days*24*60*60*1000));
		var expires = "; expires="+date.toGMTString();
	}
	else 
	{
		var date = new Date();
		date.setTime(date.getTime()+(1000*60*15)); // 15 minute
		var expires = "; expires="+date.toGMTString();
	}
	document.cookie = name+"="+value+expires+"; path="+window.location.pathname;
}


function readCookie(name) {
	var nameEQ = name + "=";
	var ca = document.cookie.split(';');
	for(var i=0;i < ca.length;i++) {
		var c = ca[i];
		while (c.charAt(0)==' ') c = c.substring(1,c.length);
		if (c.indexOf(nameEQ) == 0) return c.substring(nameEQ.length,c.length);
	}
	return null;
}

function tab_state_save ()
{
	try {
		var state_tabs = JSON.parse(readCookie(crc32('StateTabs')));
	} catch (e) {
		var state_tabs = {};
	}
	if (!state_tabs)
		var state_tabs = {};

	$('.nav').each(function (){
		// Get Name of tab      
		var tabs_name = [];
		$(this).find('a[data-toggle="tab"]').each(function (){
			tabs_name.push($(this).attr('href'));
		});
		var nav_name = crc32(tabs_name.toString());

		// Bind shown state save & Set active element
		$(this).find('a[data-toggle="tab"]').each(function (){
			var tab_name = crc32($(this).attr('href'));

			if (state_tabs[nav_name] == tab_name)
			$(this).tab('show');

		$(this).on('shown.bs.tab',function(e) {
			state_tabs[nav_name] = tab_name;
			create_cookie(crc32('StateTabs'),JSON.stringify(state_tabs),1);
		});
		});
	});
}

var crc32 = (function()
		{
			var table = [0, 1996959894, 3993919788, 2567524794, 124634137, 1886057615, 3915621685, 2657392035, 249268274, 2044508324, 3772115230, 2547177864, 162941995, 2125561021, 3887607047, 2428444049, 498536548, 1789927666, 4089016648, 2227061214, 450548861, 1843258603, 4107580753, 2211677639, 325883990, 1684777152, 4251122042, 2321926636, 335633487, 1661365465, 4195302755, 2366115317, 997073096, 1281953886, 3579855332, 2724688242, 1006888145, 1258607687, 3524101629, 2768942443, 901097722, 1119000684, 3686517206, 2898065728, 853044451, 1172266101, 3705015759, 2882616665, 651767980, 1373503546, 3369554304, 3218104598, 565507253, 1454621731, 3485111705, 3099436303, 671266974, 1594198024, 3322730930, 2970347812, 795835527, 1483230225, 3244367275, 3060149565, 1994146192, 31158534, 2563907772, 4023717930, 1907459465, 112637215, 2680153253, 3904427059, 2013776290, 251722036, 2517215374, 3775830040, 2137656763, 141376813, 2439277719, 3865271297, 1802195444, 476864866, 2238001368, 4066508878, 1812370925, 453092731, 2181625025, 4111451223, 1706088902, 314042704, 2344532202, 4240017532, 1658658271, 366619977, 2362670323, 4224994405, 1303535960, 984961486, 2747007092, 3569037538, 1256170817, 1037604311, 2765210733, 3554079995, 1131014506, 879679996, 2909243462, 3663771856, 1141124467, 855842277, 2852801631, 3708648649, 1342533948, 654459306, 3188396048, 3373015174, 1466479909, 544179635, 3110523913, 3462522015, 1591671054, 702138776, 2966460450, 3352799412, 1504918807, 783551873, 3082640443, 3233442989, 3988292384, 2596254646, 62317068, 1957810842, 3939845945, 2647816111, 81470997, 1943803523, 3814918930, 2489596804, 225274430, 2053790376, 3826175755, 2466906013, 167816743, 2097651377, 4027552580, 2265490386, 503444072, 1762050814, 4150417245, 2154129355, 426522225, 1852507879, 4275313526, 2312317920, 282753626, 1742555852, 4189708143, 2394877945, 397917763, 1622183637, 3604390888, 2714866558, 953729732, 1340076626, 3518719985, 2797360999, 1068828381, 1219638859, 3624741850, 2936675148, 906185462, 1090812512, 3747672003, 2825379669, 829329135, 1181335161, 3412177804, 3160834842, 628085408, 1382605366, 3423369109, 3138078467, 570562233, 1426400815, 3317316542, 2998733608, 733239954, 1555261956, 3268935591, 3050360625, 752459403, 1541320221, 2607071920, 3965973030, 1969922972, 40735498, 2617837225, 3943577151, 1913087877, 83908371, 2512341634, 3803740692, 2075208622, 213261112, 2463272603, 3855990285, 2094854071, 198958881, 2262029012, 4057260610, 1759359992, 534414190, 2176718541, 4139329115, 1873836001, 414664567, 2282248934, 4279200368, 1711684554, 285281116, 2405801727, 4167216745, 1634467795, 376229701, 2685067896, 3608007406, 1308918612, 956543938, 2808555105, 3495958263, 1231636301, 1047427035, 2932959818, 3654703836, 1088359270, 936918000, 2847714899, 3736837829, 1202900863, 817233897, 3183342108, 3401237130, 1404277552, 615818150, 3134207493, 3453421203, 1423857449, 601450431, 3009837614, 3294710456, 1567103746, 711928724, 3020668471, 3272380065, 1510334235, 755167117];

			return function(str)
{
	var crc = 0 ^ (-1);
	for(var i=0, l=str.length; i<l; i++) {
		crc = (crc >>> 8) ^ table[(crc ^ str.charCodeAt(i)) & 0xFF];
	}

	return crc ^ (-1);
};
})();

function get_all_items ()
{

	return [{"type":0,"meta":0,"name":"Air","text_type":"air"},{"type":1,"meta":0,"name":"Stone","text_type":"stone"},{"type":1,"meta":1,"name":"Granite","text_type":"stone"},{"type":1,"meta":2,"name":"Polished Granite","text_type":"stone"},{"type":1,"meta":3,"name":"Diorite","text_type":"stone"},{"type":1,"meta":4,"name":"Polished Diorite","text_type":"stone"},{"type":1,"meta":5,"name":"Andesite","text_type":"stone"},{"type":1,"meta":6,"name":"Polished Andesite","text_type":"stone"},{"type":2,"meta":0,"name":"Grass","text_type":"grass"},{"type":3,"meta":0,"name":"Dirt","text_type":"dirt"},{"type":3,"meta":1,"name":"Coarse Dirt","text_type":"dirt"},{"type":3,"meta":2,"name":"Podzol","text_type":"dirt"},{"type":4,"meta":0,"name":"Cobblestone","text_type":"cobblestone"},{"type":5,"meta":0,"name":"Oak Wood Plank","text_type":"planks"},{"type":5,"meta":1,"name":"Spruce Wood Plank","text_type":"planks"},{"type":5,"meta":2,"name":"Birch Wood Plank","text_type":"planks"},{"type":5,"meta":3,"name":"Jungle Wood Plank","text_type":"planks"},{"type":5,"meta":4,"name":"Acacia Wood Plank","text_type":"planks"},{"type":5,"meta":5,"name":"Dark Oak Wood Plank","text_type":"planks"},{"type":6,"meta":0,"name":"Oak Sapling","text_type":"sapling"},{"type":6,"meta":1,"name":"Spruce Sapling","text_type":"sapling"},{"type":6,"meta":2,"name":"Birch Sapling","text_type":"sapling"},{"type":6,"meta":3,"name":"Jungle Sapling","text_type":"sapling"},{"type":6,"meta":4,"name":"Acacia Sapling","text_type":"sapling"},{"type":6,"meta":5,"name":"Dark Oak Sapling","text_type":"sapling"},{"type":7,"meta":0,"name":"Bedrock","text_type":"bedrock"},{"type":8,"meta":0,"name":"Flowing Water","text_type":"flowing_water"},{"type":9,"meta":0,"name":"Still Water","text_type":"water"},{"type":10,"meta":0,"name":"Flowing Lava","text_type":"flowing_lava"},{"type":11,"meta":0,"name":"Still Lava","text_type":"lava"},{"type":12,"meta":0,"name":"Sand","text_type":"sand"},{"type":12,"meta":1,"name":"Red Sand","text_type":"sand"},{"type":13,"meta":0,"name":"Gravel","text_type":"gravel"},{"type":14,"meta":0,"name":"Gold Ore","text_type":"gold_ore"},{"type":15,"meta":0,"name":"Iron Ore","text_type":"iron_ore"},{"type":16,"meta":0,"name":"Coal Ore","text_type":"coal_ore"},{"type":17,"meta":0,"name":"Oak Wood","text_type":"log"},{"type":17,"meta":1,"name":"Spruce Wood","text_type":"log"},{"type":17,"meta":2,"name":"Birch Wood","text_type":"log"},{"type":17,"meta":3,"name":"Jungle Wood","text_type":"log"},{"type":18,"meta":0,"name":"Oak Leaves","text_type":"leaves"},{"type":18,"meta":1,"name":"Spruce Leaves","text_type":"leaves"},{"type":18,"meta":2,"name":"Birch Leaves","text_type":"leaves"},{"type":18,"meta":3,"name":"Jungle Leaves","text_type":"leaves"},{"type":19,"meta":0,"name":"Sponge","text_type":"sponge"},{"type":19,"meta":1,"name":"Wet Sponge","text_type":"sponge"},{"type":20,"meta":0,"name":"Glass","text_type":"glass"},{"type":21,"meta":0,"name":"Lapis Lazuli Ore","text_type":"lapis_ore"},{"type":22,"meta":0,"name":"Lapis Lazuli Block","text_type":"lapis_block"},{"type":23,"meta":0,"name":"Dispenser","text_type":"dispenser"},{"type":24,"meta":0,"name":"Sandstone","text_type":"sandstone"},{"type":24,"meta":1,"name":"Chiseled Sandstone","text_type":"sandstone"},{"type":24,"meta":2,"name":"Smooth Sandstone","text_type":"sandstone"},{"type":25,"meta":0,"name":"Note Block","text_type":"noteblock"},{"type":26,"meta":0,"name":"Bed","text_type":"bed"},{"type":27,"meta":0,"name":"Powered Rail","text_type":"golden_rail"},{"type":28,"meta":0,"name":"Detector Rail","text_type":"detector_rail"},{"type":29,"meta":0,"name":"Sticky Piston","text_type":"sticky_piston"},{"type":30,"meta":0,"name":"Cobweb","text_type":"web"},{"type":31,"meta":0,"name":"Dead Shrub","text_type":"tallgrass"},{"type":31,"meta":1,"name":"Grass","text_type":"tallgrass"},{"type":31,"meta":2,"name":"Fern","text_type":"tallgrass"},{"type":32,"meta":0,"name":"Dead Shrub","text_type":"deadbush"},{"type":33,"meta":0,"name":"Piston","text_type":"piston"},{"type":34,"meta":0,"name":"Piston Head","text_type":"piston_head"},{"type":35,"meta":0,"name":"White Wool","text_type":"wool"},{"type":35,"meta":1,"name":"Orange Wool","text_type":"wool"},{"type":35,"meta":2,"name":"Magenta Wool","text_type":"wool"},{"type":35,"meta":3,"name":"Light Blue Wool","text_type":"wool"},{"type":35,"meta":4,"name":"Yellow Wool","text_type":"wool"},{"type":35,"meta":5,"name":"Lime Wool","text_type":"wool"},{"type":35,"meta":6,"name":"Pink Wool","text_type":"wool"},{"type":35,"meta":7,"name":"Gray Wool","text_type":"wool"},{"type":35,"meta":8,"name":"Light Gray Wool","text_type":"wool"},{"type":35,"meta":9,"name":"Cyan Wool","text_type":"wool"},{"type":35,"meta":10,"name":"Purple Wool","text_type":"wool"},{"type":35,"meta":11,"name":"Blue Wool","text_type":"wool"},{"type":35,"meta":12,"name":"Brown Wool","text_type":"wool"},{"type":35,"meta":13,"name":"Green Wool","text_type":"wool"},{"type":35,"meta":14,"name":"Red Wool","text_type":"wool"},{"type":35,"meta":15,"name":"Black Wool","text_type":"wool"},{"type":37,"meta":0,"name":"Dandelion","text_type":"yellow_flower"},{"type":38,"meta":0,"name":"Poppy","text_type":"red_flower"},{"type":38,"meta":1,"name":"Blue Orchid","text_type":"red_flower"},{"type":38,"meta":2,"name":"Allium","text_type":"red_flower"},{"type":38,"meta":3,"name":"Azure Bluet","text_type":"red_flower"},{"type":38,"meta":4,"name":"Red Tulip","text_type":"red_flower"},{"type":38,"meta":5,"name":"Orange Tulip","text_type":"red_flower"},{"type":38,"meta":6,"name":"White Tulip","text_type":"red_flower"},{"type":38,"meta":7,"name":"Pink Tulip","text_type":"red_flower"},{"type":38,"meta":8,"name":"Oxeye Daisy","text_type":"red_flower"},{"type":39,"meta":0,"name":"Brown Mushroom","text_type":"brown_mushroom"},{"type":40,"meta":0,"name":"Red Mushroom","text_type":"red_mushroom"},{"type":41,"meta":0,"name":"Gold Block","text_type":"gold_block"},{"type":42,"meta":0,"name":"Iron Block","text_type":"iron_block"},{"type":43,"meta":0,"name":"Double Stone Slab","text_type":"double_stone_slab"},{"type":43,"meta":1,"name":"Double Sandstone Slab","text_type":"double_stone_slab"},{"type":43,"meta":2,"name":"Double Wooden Slab","text_type":"double_stone_slab"},{"type":43,"meta":3,"name":"Double Cobblestone Slab","text_type":"double_stone_slab"},{"type":43,"meta":4,"name":"Double Brick Slab","text_type":"double_stone_slab"},{"type":43,"meta":5,"name":"Double Stone Brick Slab","text_type":"double_stone_slab"},{"type":43,"meta":6,"name":"Double Nether Brick Slab","text_type":"double_stone_slab"},{"type":43,"meta":7,"name":"Double Quartz Slab","text_type":"double_stone_slab"},{"type":44,"meta":0,"name":"Stone Slab","text_type":"stone_slab"},{"type":44,"meta":1,"name":"Sandstone Slab","text_type":"stone_slab"},{"type":44,"meta":2,"name":"Wooden Slab","text_type":"stone_slab"},{"type":44,"meta":3,"name":"Cobblestone Slab","text_type":"stone_slab"},{"type":44,"meta":4,"name":"Brick Slab","text_type":"stone_slab"},{"type":44,"meta":5,"name":"Stone Brick Slab","text_type":"stone_slab"},{"type":44,"meta":6,"name":"Nether Brick Slab","text_type":"stone_slab"},{"type":44,"meta":7,"name":"Quartz Slab","text_type":"stone_slab"},{"type":45,"meta":0,"name":"Bricks","text_type":"brick_block"},{"type":46,"meta":0,"name":"TNT","text_type":"tnt"},{"type":47,"meta":0,"name":"Bookshelf","text_type":"bookshelf"},{"type":48,"meta":0,"name":"Moss Stone","text_type":"mossy_cobblestone"},{"type":49,"meta":0,"name":"Obsidian","text_type":"obsidian"},{"type":50,"meta":0,"name":"Torch","text_type":"torch"},{"type":51,"meta":0,"name":"Fire","text_type":"fire"},{"type":52,"meta":0,"name":"Monster Spawner","text_type":"mob_spawner"},{"type":53,"meta":0,"name":"Oak Wood Stairs","text_type":"oak_stairs"},{"type":54,"meta":0,"name":"Chest","text_type":"chest"},{"type":55,"meta":0,"name":"Redstone Wire","text_type":"redstone_wire"},{"type":56,"meta":0,"name":"Diamond Ore","text_type":"diamond_ore"},{"type":57,"meta":0,"name":"Diamond Block","text_type":"diamond_block"},{"type":58,"meta":0,"name":"Crafting Table","text_type":"crafting_table"},{"type":59,"meta":0,"name":"Wheat Crops","text_type":"wheat"},{"type":60,"meta":0,"name":"Farmland","text_type":"farmland"},{"type":61,"meta":0,"name":"Furnace","text_type":"furnace"},{"type":62,"meta":0,"name":"Burning Furnace","text_type":"lit_furnace"},{"type":63,"meta":0,"name":"Standing Sign Block","text_type":"standing_sign"},{"type":64,"meta":0,"name":"Oak Door Block","text_type":"wooden_door"},{"type":65,"meta":0,"name":"Ladder","text_type":"ladder"},{"type":66,"meta":0,"name":"Rail","text_type":"rail"},{"type":67,"meta":0,"name":"Cobblestone Stairs","text_type":"stone_stairs"},{"type":68,"meta":0,"name":"Wall-mounted Sign Block","text_type":"wall_sign"},{"type":69,"meta":0,"name":"Lever","text_type":"lever"},{"type":70,"meta":0,"name":"Stone Pressure Plate","text_type":"stone_pressure_plate"},{"type":71,"meta":0,"name":"Iron Door Block","text_type":"iron_door"},{"type":72,"meta":0,"name":"Wooden Pressure Plate","text_type":"wooden_pressure_plate"},{"type":73,"meta":0,"name":"Redstone Ore","text_type":"redstone_ore"},{"type":74,"meta":0,"name":"Glowing Redstone Ore","text_type":"lit_redstone_ore"},{"type":75,"meta":0,"name":"Redstone Torch (off)","text_type":"unlit_redstone_torch"},{"type":76,"meta":0,"name":"Redstone Torch (on)","text_type":"redstone_torch"},{"type":77,"meta":0,"name":"Stone Button","text_type":"stone_button"},{"type":78,"meta":0,"name":"Snow","text_type":"snow_layer"},{"type":79,"meta":0,"name":"Ice","text_type":"ice"},{"type":80,"meta":0,"name":"Snow Block","text_type":"snow"},{"type":81,"meta":0,"name":"Cactus","text_type":"cactus"},{"type":82,"meta":0,"name":"Clay","text_type":"clay"},{"type":83,"meta":0,"name":"Sugar Canes","text_type":"reeds"},{"type":84,"meta":0,"name":"Jukebox","text_type":"jukebox"},{"type":85,"meta":0,"name":"Oak Fence","text_type":"fence"},{"type":86,"meta":0,"name":"Pumpkin","text_type":"pumpkin"},{"type":87,"meta":0,"name":"Netherrack","text_type":"netherrack"},{"type":88,"meta":0,"name":"Soul Sand","text_type":"soul_sand"},{"type":89,"meta":0,"name":"Glowstone","text_type":"glowstone"},{"type":90,"meta":0,"name":"Nether Portal","text_type":"portal"},{"type":91,"meta":0,"name":"Jack o'Lantern","text_type":"lit_pumpkin"},{"type":92,"meta":0,"name":"Cake Block","text_type":"cake"},{"type":93,"meta":0,"name":"Redstone Repeater Block (off)","text_type":"unpowered_repeater"},{"type":94,"meta":0,"name":"Redstone Repeater Block (on)","text_type":"powered_repeater"},{"type":95,"meta":0,"name":"White Stained Glass","text_type":"stained_glass"},{"type":95,"meta":1,"name":"Orange Stained Glass","text_type":"stained_glass"},{"type":95,"meta":2,"name":"Magenta Stained Glass","text_type":"stained_glass"},{"type":95,"meta":3,"name":"Light Blue Stained Glass","text_type":"stained_glass"},{"type":95,"meta":4,"name":"Yellow Stained Glass","text_type":"stained_glass"},{"type":95,"meta":5,"name":"Lime Stained Glass","text_type":"stained_glass"},{"type":95,"meta":6,"name":"Pink Stained Glass","text_type":"stained_glass"},{"type":95,"meta":7,"name":"Gray Stained Glass","text_type":"stained_glass"},{"type":95,"meta":8,"name":"Light Gray Stained Glass","text_type":"stained_glass"},{"type":95,"meta":9,"name":"Cyan Stained Glass","text_type":"stained_glass"},{"type":95,"meta":10,"name":"Purple Stained Glass","text_type":"stained_glass"},{"type":95,"meta":11,"name":"Blue Stained Glass","text_type":"stained_glass"},{"type":95,"meta":12,"name":"Brown Stained Glass","text_type":"stained_glass"},{"type":95,"meta":13,"name":"Green Stained Glass","text_type":"stained_glass"},{"type":95,"meta":14,"name":"Red Stained Glass","text_type":"stained_glass"},{"type":95,"meta":15,"name":"Black Stained Glass","text_type":"stained_glass"},{"type":96,"meta":0,"name":"Wooden Trapdoor","text_type":"trapdoor"},{"type":97,"meta":0,"name":"Stone Monster Egg","text_type":"monster_egg"},{"type":97,"meta":1,"name":"Cobblestone Monster Egg","text_type":"monster_egg"},{"type":97,"meta":2,"name":"Stone Brick Monster Egg","text_type":"monster_egg"},{"type":97,"meta":3,"name":"Mossy Stone Brick Monster Egg","text_type":"monster_egg"},{"type":97,"meta":4,"name":"Cracked Stone Brick Monster Egg","text_type":"monster_egg"},{"type":97,"meta":5,"name":"Chiseled Stone Brick Monster Egg","text_type":"monster_egg"},{"type":98,"meta":0,"name":"Stone Bricks","text_type":"stonebrick"},{"type":98,"meta":1,"name":"Mossy Stone Bricks","text_type":"stonebrick"},{"type":98,"meta":2,"name":"Cracked Stone Bricks","text_type":"stonebrick"},{"type":98,"meta":3,"name":"Chiseled Stone Bricks","text_type":"stonebrick"},{"type":99,"meta":0,"name":"Red Mushroom Cap","text_type":"stonebrick"},{"type":100,"meta":0,"name":"Brown Mushroom Cap","text_type":"stonebrick"},{"type":101,"meta":0,"name":"Iron Bars","text_type":"iron_bars"},{"type":102,"meta":0,"name":"Glass Pane","text_type":"glass_pane"},{"type":103,"meta":0,"name":"Melon Block","text_type":"melon_block"},{"type":104,"meta":0,"name":"Pumpkin Stem","text_type":"pumpkin_stem"},{"type":105,"meta":0,"name":"Melon Stem","text_type":"melon_stem"},{"type":106,"meta":0,"name":"Vines","text_type":"vine"},{"type":107,"meta":0,"name":"Oak Fence Gate","text_type":"fence_gate"},{"type":108,"meta":0,"name":"Brick Stairs","text_type":"brick_stairs"},{"type":109,"meta":0,"name":"Stone Brick Stairs","text_type":"stone_brick_stairs"},{"type":110,"meta":0,"name":"Mycelium","text_type":"mycelium"},{"type":111,"meta":0,"name":"Lily Pad","text_type":"waterlily"},{"type":112,"meta":0,"name":"Nether Brick","text_type":"nether_brick"},{"type":113,"meta":0,"name":"Nether Brick Fence","text_type":"nether_brick_fence"},{"type":114,"meta":0,"name":"Nether Brick Stairs","text_type":"nether_brick_stairs"},{"type":115,"meta":0,"name":"Nether Wart","text_type":"nether_wart"},{"type":116,"meta":0,"name":"Enchantment Table","text_type":"enchanting_table"},{"type":117,"meta":0,"name":"Brewing Stand","text_type":"brewing_stand"},{"type":118,"meta":0,"name":"Cauldron","text_type":"cauldron"},{"type":119,"meta":0,"name":"End Portal","text_type":"end_portal"},{"type":120,"meta":0,"name":"End Portal Frame","text_type":"end_portal_frame"},{"type":121,"meta":0,"name":"End Stone","text_type":"end_stone"},{"type":122,"meta":0,"name":"Dragon Egg","text_type":"dragon_egg"},{"type":123,"meta":0,"name":"Redstone Lamp (inactive)","text_type":"redstone_lamp"},{"type":124,"meta":0,"name":"Redstone Lamp (active)","text_type":"lit_redstone_lamp"},{"type":125,"meta":0,"name":"Double Oak Wood Slab","text_type":"double_wooden_slab"},{"type":125,"meta":1,"name":"Double Spruce Wood Slab","text_type":"double_wooden_slab"},{"type":125,"meta":2,"name":"Double Birch Wood Slab","text_type":"double_wooden_slab"},{"type":125,"meta":3,"name":"Double Jungle Wood Slab","text_type":"double_wooden_slab"},{"type":125,"meta":4,"name":"Double Acacia Wood Slab","text_type":"double_wooden_slab"},{"type":125,"meta":5,"name":"Double Dark Oak Wood Slab","text_type":"double_wooden_slab"},{"type":126,"meta":0,"name":"Oak Wood Slab","text_type":"wooden_slab"},{"type":126,"meta":1,"name":"Spruce Wood Slab","text_type":"wooden_slab"},{"type":126,"meta":2,"name":"Birch Wood Slab","text_type":"wooden_slab"},{"type":126,"meta":3,"name":"Jungle Wood Slab","text_type":"wooden_slab"},{"type":126,"meta":4,"name":"Acacia Wood Slab","text_type":"wooden_slab"},{"type":126,"meta":5,"name":"Dark Oak Wood Slab","text_type":"wooden_slab"},{"type":127,"meta":0,"name":"Cocoa","text_type":"cocoa"},{"type":128,"meta":0,"name":"Sandstone Stairs","text_type":"sandstone_stairs"},{"type":129,"meta":0,"name":"Emerald Ore","text_type":"emerald_ore"},{"type":130,"meta":0,"name":"Ender Chest","text_type":"ender_chest"},{"type":131,"meta":0,"name":"Tripwire Hook","text_type":"tripwire_hook"},{"type":132,"meta":0,"name":"Tripwire","text_type":"tripwire_hook"},{"type":133,"meta":0,"name":"Emerald Block","text_type":"emerald_block"},{"type":134,"meta":0,"name":"Spruce Wood Stairs","text_type":"spruce_stairs"},{"type":135,"meta":0,"name":"Birch Wood Stairs","text_type":"birch_stairs"},{"type":136,"meta":0,"name":"Jungle Wood Stairs","text_type":"jungle_stairs"},{"type":137,"meta":0,"name":"Command Block","text_type":"command_block"},{"type":138,"meta":0,"name":"Beacon","text_type":"beacon"},{"type":139,"meta":0,"name":"Cobblestone Wall","text_type":"cobblestone_wall"},{"type":139,"meta":1,"name":"Mossy Cobblestone Wall","text_type":"cobblestone_wall"},{"type":140,"meta":0,"name":"Flower Pot","text_type":"flower_pot"},{"type":141,"meta":0,"name":"Carrots","text_type":"carrots"},{"type":142,"meta":0,"name":"Potatoes","text_type":"potatoes"},{"type":143,"meta":0,"name":"Wooden Button","text_type":"wooden_button"},{"type":144,"meta":0,"name":"Mob Head","text_type":"skull"},{"type":145,"meta":0,"name":"Anvil","text_type":"anvil"},{"type":146,"meta":0,"name":"Trapped Chest","text_type":"trapped_chest"},{"type":147,"meta":0,"name":"Weighted Pressure Plate (light)","text_type":"light_weighted_pressure_plate"},{"type":148,"meta":0,"name":"Weighted Pressure Plate (heavy)","text_type":"heavy_weighted_pressure_plate"},{"type":149,"meta":0,"name":"Redstone Comparator (inactive)","text_type":"unpowered_comparator"},{"type":150,"meta":0,"name":"Redstone Comparator (active)","text_type":"powered_comparator"},{"type":151,"meta":0,"name":"Daylight Sensor","text_type":"daylight_detector"},{"type":152,"meta":0,"name":"Redstone Block","text_type":"redstone_block"},{"type":153,"meta":0,"name":"Nether Quartz Ore","text_type":"quartz_ore"},{"type":154,"meta":0,"name":"Hopper","text_type":"hopper"},{"type":155,"meta":0,"name":"Quartz Block","text_type":"quartz_block"},{"type":155,"meta":1,"name":"Chiseled Quartz Block","text_type":"quartz_block"},{"type":155,"meta":2,"name":"Pillar Quartz Block","text_type":"quartz_block"},{"type":156,"meta":0,"name":"Quartz Stairs","text_type":"quartz_stairs"},{"type":157,"meta":0,"name":"Activator Rail","text_type":"activator_rail"},{"type":158,"meta":0,"name":"Dropper","text_type":"dropper"},{"type":159,"meta":0,"name":"White Stained Clay","text_type":"stained_hardened_clay"},{"type":159,"meta":1,"name":"Orange Stained Clay","text_type":"stained_hardened_clay"},{"type":159,"meta":2,"name":"Magenta Stained Clay","text_type":"stained_hardened_clay"},{"type":159,"meta":3,"name":"Light Blue Stained Clay","text_type":"stained_hardened_clay"},{"type":159,"meta":4,"name":"Yellow Stained Clay","text_type":"stained_hardened_clay"},{"type":159,"meta":5,"name":"Lime Stained Clay","text_type":"stained_hardened_clay"},{"type":159,"meta":6,"name":"Pink Stained Clay","text_type":"stained_hardened_clay"},{"type":159,"meta":7,"name":"Gray Stained Clay","text_type":"stained_hardened_clay"},{"type":159,"meta":8,"name":"Light Gray Stained Clay","text_type":"stained_hardened_clay"},{"type":159,"meta":9,"name":"Cyan Stained Clay","text_type":"stained_hardened_clay"},{"type":159,"meta":10,"name":"Purple Stained Clay","text_type":"stained_hardened_clay"},{"type":159,"meta":11,"name":"Blue Stained Clay","text_type":"stained_hardened_clay"},{"type":159,"meta":12,"name":"Brown Stained Clay","text_type":"stained_hardened_clay"},{"type":159,"meta":13,"name":"Green Stained Clay","text_type":"stained_hardened_clay"},{"type":159,"meta":14,"name":"Red Stained Clay","text_type":"stained_hardened_clay"},{"type":159,"meta":15,"name":"Black Stained Clay","text_type":"stained_hardened_clay"},{"type":160,"meta":0,"name":"White Stained Glass Pane","text_type":"stained_glass_pane"},{"type":160,"meta":1,"name":"Orange Stained Glass Pane","text_type":"stained_glass_pane"},{"type":160,"meta":2,"name":"Magenta Stained Glass Pane","text_type":"stained_glass_pane"},{"type":160,"meta":3,"name":"Light Blue Stained Glass Pane","text_type":"stained_glass_pane"},{"type":160,"meta":4,"name":"Yellow Stained Glass Pane","text_type":"stained_glass_pane"},{"type":160,"meta":5,"name":"Lime Stained Glass Pane","text_type":"stained_glass_pane"},{"type":160,"meta":6,"name":"Pink Stained Glass Pane","text_type":"stained_glass_pane"},{"type":160,"meta":7,"name":"Gray Stained Glass Pane","text_type":"stained_glass_pane"},{"type":160,"meta":8,"name":"Light Gray Stained Glass Pane","text_type":"stained_glass_pane"},{"type":160,"meta":9,"name":"Cyan Stained Glass Pane","text_type":"stained_glass_pane"},{"type":160,"meta":10,"name":"Purple Stained Glass Pane","text_type":"stained_glass_pane"},{"type":160,"meta":11,"name":"Blue Stained Glass Pane","text_type":"stained_glass_pane"},{"type":160,"meta":12,"name":"Brown Stained Glass Pane","text_type":"stained_glass_pane"},{"type":160,"meta":13,"name":"Green Stained Glass Pane","text_type":"stained_glass_pane"},{"type":160,"meta":14,"name":"Red Stained Glass Pane","text_type":"stained_glass_pane"},{"type":160,"meta":15,"name":"Black Stained Glass Pane","text_type":"stained_glass_pane"},{"type":161,"meta":0,"name":"Acacia Leaves","text_type":"leaves2"},{"type":161,"meta":1,"name":"Dark Oak Leaves","text_type":"leaves2"},{"type":162,"meta":0,"name":"Acacia Wood","text_type":"logs2"},{"type":162,"meta":1,"name":"Dark Oak Wood","text_type":"logs2"},{"type":163,"meta":0,"name":"Acacia Wood Stairs","text_type":"acacia_stairs"},{"type":164,"meta":0,"name":"Dark Oak Wood Stairs","text_type":"dark_oak_stairs"},{"type":165,"meta":0,"name":"Slime Block","text_type":"slime"},{"type":166,"meta":0,"name":"Barrier","text_type":"barrier"},{"type":167,"meta":0,"name":"Iron Trapdoor","text_type":"iron_trapdoor"},{"type":168,"meta":0,"name":"Prismarine","text_type":"prismarine"},{"type":168,"meta":1,"name":"Prismarine Bricks","text_type":"prismarine"},{"type":168,"meta":2,"name":"Dark Prismarine","text_type":"prismarine"},{"type":169,"meta":0,"name":"Sea Lantern","text_type":"sea_lantern"},{"type":170,"meta":0,"name":"Hay Bale","text_type":"hay_block"},{"type":171,"meta":0,"name":"White Carpet","text_type":"carpet"},{"type":171,"meta":1,"name":"Orange Carpet","text_type":"carpet"},{"type":171,"meta":2,"name":"Magenta Carpet","text_type":"carpet"},{"type":171,"meta":3,"name":"Light Blue Carpet","text_type":"carpet"},{"type":171,"meta":4,"name":"Yellow Carpet","text_type":"carpet"},{"type":171,"meta":5,"name":"Lime Carpet","text_type":"carpet"},{"type":171,"meta":6,"name":"Pink Carpet","text_type":"carpet"},{"type":171,"meta":7,"name":"Gray Carpet","text_type":"carpet"},{"type":171,"meta":8,"name":"Light Gray Carpet","text_type":"carpet"},{"type":171,"meta":9,"name":"Cyan Carpet","text_type":"carpet"},{"type":171,"meta":10,"name":"Purple Carpet","text_type":"carpet"},{"type":171,"meta":11,"name":"Blue Carpet","text_type":"carpet"},{"type":171,"meta":12,"name":"Brown Carpet","text_type":"carpet"},{"type":171,"meta":13,"name":"Green Carpet","text_type":"carpet"},{"type":171,"meta":14,"name":"Red Carpet","text_type":"carpet"},{"type":171,"meta":15,"name":"Black Carpet","text_type":"carpet"},{"type":172,"meta":0,"name":"Hardened Clay","text_type":"hardened_clay"},{"type":173,"meta":0,"name":"Block of Coal","text_type":"coal_block"},{"type":174,"meta":0,"name":"Packed Ice","text_type":"packed_ice"},{"type":175,"meta":0,"name":"Sunflower","text_type":"double_plant"},{"type":175,"meta":1,"name":"Lilac","text_type":"double_plant"},{"type":175,"meta":2,"name":"Double Tallgrass","text_type":"double_plant"},{"type":175,"meta":3,"name":"Large Fern","text_type":"double_plant"},{"type":175,"meta":4,"name":"Rose Bush","text_type":"double_plant"},{"type":175,"meta":5,"name":"Peony","text_type":"double_plant"},{"type":176,"meta":0,"name":"Free-standing Banner","text_type":"standing_banner"},{"type":177,"meta":0,"name":"Wall-mounted Banner","text_type":"wall_banner"},{"type":178,"meta":0,"name":"Inverted Daylight Sensor","text_type":"daylight_detector_inverted"},{"type":179,"meta":0,"name":"Red Sandstone","text_type":"red_sandstone"},{"type":179,"meta":1,"name":"Smooth Red Sandstone","text_type":"red_sandstone"},{"type":179,"meta":2,"name":"Chiseled Red Sandstone","text_type":"red_sandstone"},{"type":180,"meta":0,"name":"Red Sandstone Stairs","text_type":"red_sandstone_stairs"},{"type":181,"meta":0,"name":"Double Red Sandstone Slab","text_type":"stone_slab2"},{"type":182,"meta":0,"name":"Red Sandstone Slab","text_type":"double_stone_slab2"},{"type":183,"meta":0,"name":"Spruce Fence Gate","text_type":"spruce_fence_gate"},{"type":184,"meta":0,"name":"Birch Fence Gate","text_type":"birch_fence_gate"},{"type":185,"meta":0,"name":"Jungle Fence Gate","text_type":"jungle_fence_gate"},{"type":186,"meta":0,"name":"Dark Oak Fence Gate","text_type":"dark_oak_fence_gate"},{"type":187,"meta":0,"name":"Acacia Fence Gate","text_type":"acacia_fence_gate"},{"type":188,"meta":0,"name":"Spruce Fence","text_type":"spruce_fence"},{"type":189,"meta":0,"name":"Birch Fence","text_type":"birch_fence"},{"type":190,"meta":0,"name":"Jungle Fence","text_type":"jungle_fence"},{"type":191,"meta":0,"name":"Dark Oak Fence","text_type":"dark_oak_fence"},{"type":192,"meta":0,"name":"Acacia Fence","text_type":"acacia_fence"},{"type":193,"meta":0,"name":"Spruce Door Block","text_type":"spruce_door"},{"type":194,"meta":0,"name":"Birch Door Block","text_type":"birch_door"},{"type":195,"meta":0,"name":"Jungle Door Block","text_type":"jungle_door"},{"type":196,"meta":0,"name":"Acacia Door Block","text_type":"acacia_door"},{"type":197,"meta":0,"name":"Dark Oak Door Block","text_type":"dark_oak_door"},{"type":256,"meta":0,"name":"Iron Shovel","text_type":"iron_shovel"},{"type":257,"meta":0,"name":"Iron Pickaxe","text_type":"iron_pickaxe"},{"type":258,"meta":0,"name":"Iron Axe","text_type":"iron_axe"},{"type":259,"meta":0,"name":"Flint and Steel","text_type":"flint_and_steel"},{"type":260,"meta":0,"name":"Apple","text_type":"apple"},{"type":261,"meta":0,"name":"Bow","text_type":"bow"},{"type":262,"meta":0,"name":"Arrow","text_type":"arrow"},{"type":263,"meta":0,"name":"Coal","text_type":"coal"},{"type":263,"meta":1,"name":"Charcoal","text_type":"coal"},{"type":264,"meta":0,"name":"Diamond","text_type":"diamond"},{"type":265,"meta":0,"name":"Iron Ingot","text_type":"iron_ingot"},{"type":266,"meta":0,"name":"Gold Ingot","text_type":"gold_ingot"},{"type":267,"meta":0,"name":"Iron Sword","text_type":"iron_sword"},{"type":268,"meta":0,"name":"Wooden Sword","text_type":"wooden_sword"},{"type":269,"meta":0,"name":"Wooden Shovel","text_type":"wooden_shovel"},{"type":270,"meta":0,"name":"Wooden Pickaxe","text_type":"wooden_pickaxe"},{"type":271,"meta":0,"name":"Wooden Axe","text_type":"wooden_axe"},{"type":272,"meta":0,"name":"Stone Sword","text_type":"stone_sword"},{"type":273,"meta":0,"name":"Stone Shovel","text_type":"stone_shovel"},{"type":274,"meta":0,"name":"Stone Pickaxe","text_type":"stone_pickaxe"},{"type":275,"meta":0,"name":"Stone Axe","text_type":"stone_axe"},{"type":276,"meta":0,"name":"Diamond Sword","text_type":"diamond_sword"},{"type":277,"meta":0,"name":"Diamond Shovel","text_type":"diamond_shovel"},{"type":278,"meta":0,"name":"Diamond Pickaxe","text_type":"diamond_pickaxe"},{"type":279,"meta":0,"name":"Diamond Axe","text_type":"diamond_axe"},{"type":280,"meta":0,"name":"Stick","text_type":"stick"},{"type":281,"meta":0,"name":"Bowl","text_type":"bowl"},{"type":282,"meta":0,"name":"Mushroom Stew","text_type":"mushroom_stew"},{"type":283,"meta":0,"name":"Golden Sword","text_type":"golden_sword"},{"type":284,"meta":0,"name":"Golden Shovel","text_type":"golden_shovel"},{"type":285,"meta":0,"name":"Golden Pickaxe","text_type":"golden_pickaxe"},{"type":286,"meta":0,"name":"Golden Axe","text_type":"golden_axe"},{"type":287,"meta":0,"name":"String","text_type":"string"},{"type":288,"meta":0,"name":"Feather","text_type":"feather"},{"type":289,"meta":0,"name":"Gunpowder","text_type":"gunpowder"},{"type":290,"meta":0,"name":"Wooden Hoe","text_type":"wooden_hoe"},{"type":291,"meta":0,"name":"Stone Hoe","text_type":"stone_hoe"},{"type":292,"meta":0,"name":"Iron Hoe","text_type":"iron_hoe"},{"type":293,"meta":0,"name":"Diamond Hoe","text_type":"diamond_hoe"},{"type":294,"meta":0,"name":"Golden Hoe","text_type":"golden_hoe"},{"type":295,"meta":0,"name":"Wheat Seeds","text_type":"wheat_seeds"},{"type":296,"meta":0,"name":"Wheat","text_type":"wheat"},{"type":297,"meta":0,"name":"Bread","text_type":"bread"},{"type":298,"meta":0,"name":"Leather Helmet","text_type":"leather_helmet"},{"type":299,"meta":0,"name":"Leather Tunic","text_type":"leather_chestplate"},{"type":300,"meta":0,"name":"Leather Pants","text_type":"leather_leggings"},{"type":301,"meta":0,"name":"Leather Boots","text_type":"leather_boots"},{"type":302,"meta":0,"name":"Chainmail Helmet","text_type":"chainmail_helmet"},{"type":303,"meta":0,"name":"Chainmail Chestplate","text_type":"chainmail_chestplate"},{"type":304,"meta":0,"name":"Chainmail Leggings","text_type":"chainmail_leggings"},{"type":305,"meta":0,"name":"Chainmail Boots","text_type":"chainmail_boots"},{"type":306,"meta":0,"name":"Iron Helmet","text_type":"iron_helmet"},{"type":307,"meta":0,"name":"Iron Chestplate","text_type":"iron_chestplate"},{"type":308,"meta":0,"name":"Iron Leggings","text_type":"iron_leggings"},{"type":309,"meta":0,"name":"Iron Boots","text_type":"iron_boots"},{"type":310,"meta":0,"name":"Diamond Helmet","text_type":"diamond_helmet"},{"type":311,"meta":0,"name":"Diamond Chestplate","text_type":"diamond_chestplate"},{"type":312,"meta":0,"name":"Diamond Leggings","text_type":"diamond_leggings"},{"type":313,"meta":0,"name":"Diamond Boots","text_type":"diamond_boots"},{"type":314,"meta":0,"name":"Golden Helmet","text_type":"golden_helmet"},{"type":315,"meta":0,"name":"Golden Chestplate","text_type":"golden_chestplate"},{"type":316,"meta":0,"name":"Golden Leggings","text_type":"golden_leggings"},{"type":317,"meta":0,"name":"Golden Boots","text_type":"golden_boots"},{"type":318,"meta":0,"name":"Flint","text_type":"flint_and_steel"},{"type":319,"meta":0,"name":"Raw Porkchop","text_type":"porkchop"},{"type":320,"meta":0,"name":"Cooked Porkchop","text_type":"cooked_porkchop"},{"type":321,"meta":0,"name":"Painting","text_type":"painting"},{"type":322,"meta":0,"name":"Golden Apple","text_type":"golden_apple"},{"type":322,"meta":1,"name":"Enchanted Golden Apple","text_type":"golden_apple"},{"type":323,"meta":0,"name":"Sign","text_type":"sign"},{"type":324,"meta":0,"name":"Oak Door","text_type":"wooden_door"},{"type":325,"meta":0,"name":"Bucket","text_type":"bucket"},{"type":326,"meta":0,"name":"Water Bucket","text_type":"water_bucket"},{"type":327,"meta":0,"name":"Lava Bucket","text_type":"lava_bucket"},{"type":328,"meta":0,"name":"Minecart","text_type":"minecart"},{"type":329,"meta":0,"name":"Saddle","text_type":"saddle"},{"type":330,"meta":0,"name":"Iron Door","text_type":"iron_door"},{"type":331,"meta":0,"name":"Redstone","text_type":"redstone"},{"type":332,"meta":0,"name":"Snowball","text_type":"snowball"},{"type":333,"meta":0,"name":"Boat","text_type":"boat"},{"type":334,"meta":0,"name":"Leather","text_type":"leather"},{"type":335,"meta":0,"name":"Milk Bucket","text_type":"milk_bucket"},{"type":336,"meta":0,"name":"Brick","text_type":"brick"},{"type":337,"meta":0,"name":"Clay","text_type":"clay_ball"},{"type":338,"meta":0,"name":"Sugar Canes","text_type":"reeds"},{"type":339,"meta":0,"name":"Paper","text_type":"paper"},{"type":340,"meta":0,"name":"Book","text_type":"book"},{"type":341,"meta":0,"name":"Slimeball","text_type":"slime_ball"},{"type":342,"meta":0,"name":"Minecart with Chest","text_type":"chest_minecart"},{"type":343,"meta":0,"name":"Minecart with Furnace","text_type":"furnace_minecart"},{"type":344,"meta":0,"name":"Egg","text_type":"egg"},{"type":345,"meta":0,"name":"Compass","text_type":"compass"},{"type":346,"meta":0,"name":"Fishing Rod","text_type":"fishing_rod"},{"type":347,"meta":0,"name":"Clock","text_type":"clock"},{"type":348,"meta":0,"name":"Glowstone Dust","text_type":"glowstone_dust"},{"type":349,"meta":0,"name":"Raw Fish","text_type":"fish"},{"type":349,"meta":1,"name":"Raw Salmon","text_type":"fish"},{"type":349,"meta":2,"name":"Clownfish","text_type":"fish"},{"type":349,"meta":3,"name":"Pufferfish","text_type":"fish"},{"type":350,"meta":0,"name":"Cooked Fish","text_type":"cooked_fish"},{"type":350,"meta":1,"name":"Cooked Salmon","text_type":"cooked_fish"},{"type":351,"meta":0,"name":"Ink Sack","text_type":"dye"},{"type":351,"meta":1,"name":"Rose Red","text_type":"dye"},{"type":351,"meta":2,"name":"Cactus Green","text_type":"dye"},{"type":351,"meta":3,"name":"Coco Beans","text_type":"dye"},{"type":351,"meta":4,"name":"Lapis Lazuli","text_type":"dye"},{"type":351,"meta":5,"name":"Purple Dye","text_type":"dye"},{"type":351,"meta":6,"name":"Cyan Dye","text_type":"dye"},{"type":351,"meta":7,"name":"Light Gray Dye","text_type":"dye"},{"type":351,"meta":8,"name":"Gray Dye","text_type":"dye"},{"type":351,"meta":9,"name":"Pink Dye","text_type":"dye"},{"type":351,"meta":10,"name":"Lime Dye","text_type":"dye"},{"type":351,"meta":11,"name":"Dandelion Yellow","text_type":"dye"},{"type":351,"meta":12,"name":"Light Blue Dye","text_type":"dye"},{"type":351,"meta":13,"name":"Magenta Dye","text_type":"dye"},{"type":351,"meta":14,"name":"Orange Dye","text_type":"dye"},{"type":351,"meta":15,"name":"Bone Meal","text_type":"dye"},{"type":352,"meta":0,"name":"Bone","text_type":"bone"},{"type":353,"meta":0,"name":"Sugar","text_type":"sugar"},{"type":354,"meta":0,"name":"Cake","text_type":"cake"},{"type":355,"meta":0,"name":"Bed","text_type":"bed"},{"type":356,"meta":0,"name":"Redstone Repeater","text_type":"repeater"},{"type":357,"meta":0,"name":"Cookie","text_type":"cookie"},{"type":358,"meta":0,"name":"Map","text_type":"filled_map"},{"type":359,"meta":0,"name":"Shears","text_type":"shears"},{"type":360,"meta":0,"name":"Melon","text_type":"melon"},{"type":361,"meta":0,"name":"Pumpkin Seeds","text_type":"pumpkin_seeds"},{"type":362,"meta":0,"name":"Melon Seeds","text_type":"melon_seeds"},{"type":363,"meta":0,"name":"Raw Beef","text_type":"beef"},{"type":364,"meta":0,"name":"Steak","text_type":"cooked_beef"},{"type":365,"meta":0,"name":"Raw Chicken","text_type":"chicken"},{"type":366,"meta":0,"name":"Cooked Chicken","text_type":"cooked_chicken"},{"type":367,"meta":0,"name":"Rotten Flesh","text_type":"rotten_flesh"},{"type":368,"meta":0,"name":"Ender Pearl","text_type":"ender_pearl"},{"type":369,"meta":0,"name":"Blaze Rod","text_type":"blaze_rod"},{"type":370,"meta":0,"name":"Ghast Tear","text_type":"ghast_tear"},{"type":371,"meta":0,"name":"Gold Nugget","text_type":"gold_nugget"},{"type":372,"meta":0,"name":"Nether Wart","text_type":"nether_wart"},{"type":373,"meta":0,"name":"Potion","text_type":"potion"},{"type":374,"meta":0,"name":"Glass Bottle","text_type":"glass_bottle"},{"type":375,"meta":0,"name":"Spider Eye","text_type":"spider_eye"},{"type":376,"meta":0,"name":"Fermented Spider Eye","text_type":"fermented_spider_eye"},{"type":377,"meta":0,"name":"Blaze Powder","text_type":"blaze_powder"},{"type":378,"meta":0,"name":"Magma Cream","text_type":"magma_cream"},{"type":379,"meta":0,"name":"Brewing Stand","text_type":"brewing_stand"},{"type":380,"meta":0,"name":"Cauldron","text_type":"cauldron"},{"type":381,"meta":0,"name":"Eye of Ender","text_type":"ender_eye"},{"type":382,"meta":0,"name":"Glistering Melon","text_type":"speckled_melon"},{"type":383,"meta":50,"name":"Spawn Creeper","text_type":"spawn_egg"},{"type":383,"meta":51,"name":"Spawn Skeleton","text_type":"spawn_egg"},{"type":383,"meta":52,"name":"Spawn Spider","text_type":"spawn_egg"},{"type":383,"meta":54,"name":"Spawn Zombie","text_type":"spawn_egg"},{"type":383,"meta":55,"name":"Spawn Slime","text_type":"spawn_egg"},{"type":383,"meta":56,"name":"Spawn Ghast","text_type":"spawn_egg"},{"type":383,"meta":57,"name":"Spawn Pigman","text_type":"spawn_egg"},{"type":383,"meta":58,"name":"Spawn Enderman","text_type":"spawn_egg"},{"type":383,"meta":59,"name":"Spawn Cave Spider","text_type":"spawn_egg"},{"type":383,"meta":60,"name":"Spawn Silverfish","text_type":"spawn_egg"},{"type":383,"meta":61,"name":"Spawn Blaze","text_type":"spawn_egg"},{"type":383,"meta":62,"name":"Spawn Magma Cube","text_type":"spawn_egg"},{"type":383,"meta":65,"name":"Spawn Bat","text_type":"spawn_egg"},{"type":383,"meta":66,"name":"Spawn Witch","text_type":"spawn_egg"},{"type":383,"meta":67,"name":"Spawn Endermite","text_type":"spawn_egg"},{"type":383,"meta":68,"name":"Spawn Guardian","text_type":"spawn_egg"},{"type":383,"meta":90,"name":"Spawn Pig","text_type":"spawn_egg"},{"type":383,"meta":91,"name":"Spawn Sheep","text_type":"spawn_egg"},{"type":383,"meta":92,"name":"Spawn Cow","text_type":"spawn_egg"},{"type":383,"meta":93,"name":"Spawn Chicken","text_type":"spawn_egg"},{"type":383,"meta":94,"name":"Spawn Squid","text_type":"spawn_egg"},{"type":383,"meta":95,"name":"Spawn Wolf","text_type":"spawn_egg"},{"type":383,"meta":96,"name":"Spawn Mooshroom","text_type":"spawn_egg"},{"type":383,"meta":98,"name":"Spawn Ocelot","text_type":"spawn_egg"},{"type":383,"meta":100,"name":"Spawn Horse","text_type":"spawn_egg"},{"type":383,"meta":101,"name":"Spawn Rabbit","text_type":"spawn_egg"},{"type":383,"meta":120,"name":"Spawn Villager","text_type":"spawn_egg"},{"type":384,"meta":0,"name":"Bottle o' Enchanting","text_type":"experience_bottle"},{"type":385,"meta":0,"name":"Fire Charge","text_type":"fire_charge"},{"type":386,"meta":0,"name":"Book and Quill","text_type":"writable_book"},{"type":387,"meta":0,"name":"Written Book","text_type":"written_book"},{"type":388,"meta":0,"name":"Emerald","text_type":"emerald"},{"type":389,"meta":0,"name":"Item Frame","text_type":"item_frame"},{"type":390,"meta":0,"name":"Flower Pot","text_type":"flower_pot"},{"type":391,"meta":0,"name":"Carrot","text_type":"carrot"},{"type":392,"meta":0,"name":"Potato","text_type":"potato"},{"type":393,"meta":0,"name":"Baked Potato","text_type":"baked_potato"},{"type":394,"meta":0,"name":"Poisonous Potato","text_type":"poisonous_potato"},{"type":395,"meta":0,"name":"Empty Map","text_type":"map"},{"type":396,"meta":0,"name":"Golden Carrot","text_type":"golden_carrot"},{"type":397,"meta":0,"name":"Mob Head (Skeleton)","text_type":"skull"},{"type":397,"meta":1,"name":"Mob Head (Wither Skeleton)","text_type":"skull"},{"type":397,"meta":2,"name":"Mob Head (Zombie)","text_type":"skull"},{"type":397,"meta":3,"name":"Mob Head (Human)","text_type":"skull"},{"type":397,"meta":4,"name":"Mob Head (Creeper)","text_type":"skull"},{"type":398,"meta":0,"name":"Carrot on a Stick","text_type":"carrot_on_a_stick"},{"type":399,"meta":0,"name":"Nether Star","text_type":"nether_star"},{"type":400,"meta":0,"name":"Pumpkin Pie","text_type":"pumpkin_pie"},{"type":401,"meta":0,"name":"Firework Rocket","text_type":"fireworks"},{"type":402,"meta":0,"name":"Firework Star","text_type":"firework_charge"},{"type":403,"meta":0,"name":"Enchanted Book","text_type":"enchanted_book"},{"type":404,"meta":0,"name":"Redstone Comparator","text_type":"comparator"},{"type":405,"meta":0,"name":"Nether Brick","text_type":"netherbrick"},{"type":406,"meta":0,"name":"Nether Quartz","text_type":"quartz"},{"type":407,"meta":0,"name":"Minecart with TNT","text_type":"tnt_minecart"},{"type":408,"meta":0,"name":"Minecart with Hopper","text_type":"hopper_minecart"},{"type":409,"meta":0,"name":"Prismarine Shard","text_type":"prismarine_shard"},{"type":410,"meta":0,"name":"Prismarine Crystals","text_type":"prismarine_crystals"},{"type":411,"meta":0,"name":"Raw Rabbit","text_type":"rabbit"},{"type":412,"meta":0,"name":"Cooked Rabbit","text_type":"cooked_rabbit"},{"type":413,"meta":0,"name":"Rabbit Stew","text_type":"rabbit_stew"},{"type":414,"meta":0,"name":"Rabbit's Foot","text_type":"rabbit_foot"},{"type":415,"meta":0,"name":"Rabbit Hide","text_type":"rabbit_hide"},{"type":416,"meta":0,"name":"Armor Stand","text_type":"armor_stand"},{"type":417,"meta":0,"name":"Iron Horse Armor","text_type":"iron_horse_armor"},{"type":418,"meta":0,"name":"Golden Horse Armor","text_type":"golden_horse_armor"},{"type":419,"meta":0,"name":"Diamond Horse Armor","text_type":"diamond_horse_armor"},{"type":420,"meta":0,"name":"Lead","text_type":"lead"},{"type":421,"meta":0,"name":"Name Tag","text_type":"name_tag"},{"type":422,"meta":0,"name":"Minecart with Command Block","text_type":"command_block_minecart"},{"type":423,"meta":0,"name":"Raw Mutton","text_type":"mutton"},{"type":424,"meta":0,"name":"Cooked Mutton","text_type":"cooked_mutton"},{"type":425,"meta":0,"name":"Banner","text_type":"banner"},{"type":427,"meta":0,"name":"Spruce Door","text_type":"spruce_door"},{"type":428,"meta":0,"name":"Birch Door","text_type":"birch_door"},{"type":429,"meta":0,"name":"Jungle Door","text_type":"jungle_door"},{"type":430,"meta":0,"name":"Acacia Door","text_type":"acacia_door"},{"type":431,"meta":0,"name":"Dark Oak Door","text_type":"dark_oak_door"},{"type":2256,"meta":0,"name":"13 Disc","text_type":"record_13"},{"type":2257,"meta":0,"name":"Cat Disc","text_type":"record_cat"},{"type":2258,"meta":0,"name":"Blocks Disc","text_type":"record_blocks"},{"type":2259,"meta":0,"name":"Chirp Disc","text_type":"record_chirp"},{"type":2260,"meta":0,"name":"Far Disc","text_type":"record_far"},{"type":2261,"meta":0,"name":"Mall Disc","text_type":"record_mall"},{"type":2262,"meta":0,"name":"Mellohi Disc","text_type":"record_mellohi"},{"type":2263,"meta":0,"name":"Stal Disc","text_type":"record_stal"},{"type":2264,"meta":0,"name":"Strad Disc","text_type":"record_strad"},{"type":2265,"meta":0,"name":"Ward Disc","text_type":"record_ward"},{"type":2266,"meta":0,"name":"11 Disc","text_type":"record_11"},{"type":2267,"meta":0,"name":"Wait Disc","text_type":"record_wait"}]
}
function get_formatted_items (raw_items)
{

	var all_items = get_all_items();
	
	var formatted_items = [];

	for (var i = 0; i < raw_items.length; i++)
	{
		var raw_item = raw_items[i];
		var slot = "";
		var damage = "0";
		var count = "";

		for (var k = 0 ; k < raw_item.length; k++)
		{
			if (raw_item[k]['name'] == 'Slot')
				slot = raw_item[k]['value'];
			if (raw_item[k]['name'] == 'Count')
				count = raw_item[k]['value'];
			if (raw_item[k]['name'] == 'Damage')
			{
				// Fix potion value
				if (raw_item[k]['value'] < 1000 )
					damage = raw_item[k]['value'];
			}
		}

		for (var j = 0; j < all_items.length; j++)
		{
			var type_name = "minecraft:"+all_items[j]['text_type'];
			var name = raw_item[0]['value'];

			// Fix Wood name
			name = name.replace("log2","log");

			if (type_name == name &&
				damage == all_items[j]['meta'])
			{
				var image = all_items[j]['type']+"-"+all_items[j]['meta']+".png";

				formatted_items.push ({
					"name":all_items[j]['name'],
					"slot":slot,
					"count":count,
					"img" :image
				});
				break;
			}
		}
	}

	return formatted_items;
}

function notifyReward(item_reward)
{
	var key = item_reward.split(" ");
	var name = key[0].replace('minecraft:','');
	var count = key[1];
	var meta = key[2];
	
	var all_items = get_all_items();
	var img = '';
	
	for (var i = 0; i < all_items.length; i++)
	{
		var item = all_items[i];
		if (item.text_type == name &&
			item.meta == meta)
		{
			name = item.name;
			img = item.type + "-" + item.meta + ".png";
			break;
		}
	}

	full_img = '<img src="images/items/' + img + '"> ';

	new PNotify({
		title: "Reward Item",
		text: full_img+name+" x"+count,
		type: 'info',
		icon:'fa fa-gift text-danger fa-lg',
	});
}

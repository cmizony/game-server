var JSON_players        =   'http://api.huitaplus.com/minecraft/latest_logs';
var refreshTime         =   60; //How many seconds should we wait between updating the JSON_players.
var avatarserver        =   'http://overviewer.org/avatar/<playername>/head'; //The address for the player avatar script. 

var showPlayerMarkers   =   true; // Should we show the players moving around on the map?
var playerMarkers       =    []; //The array of player objects

var showPlayerList      =   true; // Use the built in player list format and show it on right?
var showPlayerCoords    =   false; // If true, will show the ingame coordinates of the player.
var playerListElement   =   '#player_list'; // default: #player_list. This option can be used to set a custom div format that has been inserted into the index page for player lists. If showPlayerList is true, this should be #player_list though.

/**
 * Create a new Player Marker
 *
 * @param    location    google.maps.LatLng    The initial location of the marker
 * @param    map            google.maps.Map        The map where the marker shoudl be displayed (the overviewer map)
 * @param    name        string                The name of the player
 * @param    icon        string                The image icon of the player
 * @param    visible        boolean                True if the marker should be displayed
 * @return    google.maps.Marker
 */
function createPlayerMarker(location,map,player) {
    var marker =  new google.maps.Marker({
        position: player.location,
        map: map,
        title: player.name,
        icon: createMarkerImage(player.y,player.icon),
        visible: (showPlayerMarkers ? player.visible : false),
        zIndex: 999
    });
    return marker;
}

/**
 * Create a new MarkerImage, based on the elevation of the player. The Higher, the bigger.
 *
 * @param    elevation    int    The elevation (y) of the player ingame.
 * @param    icon        string                The image icon of the player
 * @return    google.maps.MarkerImage
 */
function createMarkerImage(elevation,icon) {
    // do a little error checking, make sure the player isn't flying into outerspace. if they are, render the size based as if they were at sky, not space.
    if(elevation < 0) elevation = 0;
    if(elevation > 256) elevation = 256;
    var markerSize = Math.round(0.0859375 * elevation + 10); //http://goo.gl/sf94W thanks Wolfram|Alpha
    //console.log(icon + " - " + elevation + " : " + markerSize); // debug only.
    
    var size                = new google.maps.Size(markerSize,markerSize);
    var markerImage         =  new google.maps.MarkerImage(icon);
    markerImage.size        = size;
    markerImage.scaledSize  = size;
    
    return markerImage;
}

/**
 *  Create a new Informational Window for a Player Marker
 *
 *  @param    name    string    The name of the player
 *  @return    goolge.maps.InfoWindow
 */
function createInfoWindow(player) {
    var infoWindow  = new google.maps.InfoWindow({content: htmlInfoWindow(player)});
    return infoWindow;
}

function htmlInfoWindow(player)
{
    var html        = "<div style='line-height: 1.35;overflow: hidden;white-space: nowrap;'>";

	html += "<div style='width:250px;'>";
	
	html += "<img style='margin:5px;width:30px'src='"+getAvatarURL(player.name)+"'/>";
	html += " <b>"+player.name+"</b><br>";
	html += "<span>(X "+parseInt(player.x)+" ; Y "+parseInt(player.y)+" ; Z "+parseInt(player.z)+")</span><br>";

	html += "<span class='label label-danger'><span class='glyphicon glyphicon-heart'></span> Life: "+player.health+"</span> ";
	html += "<span class='label label-warning'><span class='glyphicon glyphicon-cutlery'></span> Food: "+player.food_level+"</span> ";
	html += "<span class='label label-success'><span class='glyphicon glyphicon-certificate'></span> Xp level: "+player.xp_level+"</span>";

	html += "<ul style='margin-top:7px' class='list-unstyled'>";
	for (var key in player.actions) 
		html += "<li><code>"+key+" ("+player.actions[key]+")</code></li>";
	html += "</ul>";

	html += "<span class='label label-default'>"+player.date.toLocaleString()+"</span>";

	html+= "</div>";
	html+= "</div>";
	return html;
}

/**
 * Create a new Listener for the Marker
 *
 * @param    marker        google.maps.Marker
 * @param    infoWindow    google.maps.InfoWindow
 * @return    google.maps.event.MapEventListener
 */
function createInfoWindowListener(marker,infoWindow) {
    var listener = google.maps.event.addListener(marker, 'click', function() {
        infoWindow.open(marker.getMap(),marker);
    });
    return listener;
}

/**
 * Create a new Player Listing
 *
 * @param    list    string    The html <ul> element ID to display the listing
 * @param    name    string    The name of the player
 * @return    jQuery
 */
function createPlayerListing(list,player) {
    $(list).append('<li id="li_'+player.name+'" style="background-image: url('+getAvatarURL(player.name)+'); cursor:pointer; background-repeat: no-repeat; padding-left: 23px;">'+player.name+' (hidden)</li>');
    return $('#li_'+player.name);
}

/**
 * Load the players JSON file and update the map
 *
 * @return void
 */
function loadPlayers() {
    $.ajax({
        url:JSON_players,
        dataType: 'json',
        cache: false,
        success: function(data) {
            for (var i in data) {

                var curTileSet = overviewer.mapView.options.currentTileSet;
				var world_name = curTileSet.get("world").get("name");

                var item          =    data[i];
                
				var player = playerMarkers[item.name] == undefined ? {} : playerMarkers[item.name];

				player.actions		   =	JSON.parse(item.actions);
                player.name            =    item.name;
                player.x               =    item.x;
                player.y               =    item.y;
                player.z               =    item.z;
				player.food_level	   =	item.food_level;
				player.health		   =	item.health;
				player.xp_level		   =	item.xp_level;
				player.xp_progress	   =	item.xp_progress;
                player.date			   =    new Date(item.date*1000);
                player.location        =    overviewer.util.fromWorldToLatLng(item.x,item.y,item.z, curTileSet);
                player.visible         =    true;
				player.updated		   =	new Date();
				player.removed		   =	false;

                /**
                 * If we receive a player that is not in the list, it must be created
                 */
                if (playerMarkers[item.name] == undefined) {
					player.icon        =    getAvatarURL(item.name);
                    player.marker      =    createPlayerMarker(location,overviewer.map,player); //create the marker
                    player.infoWindow  =    createInfoWindow(player); //create the info window
                    player.listener    =    createInfoWindowListener(player.marker,player.infoWindow); //create the listener on the marker for the info window
                    player.listing     =    createPlayerListing(playerListElement,player); //create the player listing
                    
                }

				playerMarkers[item.name]    =  player;

				console.log(player);
                updatePlayer(player); //Update the player on the map
            }
            checkPlayers(); //Check for offline players
        }
    });
}

/**
 * Update the player on the map
 *
 * @param    name    string    The name of the player
 * @return    void
 */
function updatePlayer(player) {

    player.marker.setPosition(player.location); //Set the marker position on the map
    player.marker.setVisible((showPlayerMarkers ? player.visible : false)); //Set the marker visibility on the map
    player.marker.setIcon(createMarkerImage(player.y,player.icon)); //Set the icon again, with proper sizing
    player.infoWindow.setPosition(player.location); //Set the InfoWindow position on the map
	player.infoWindow.setContent (htmlInfoWindow(player));
    player.listing.toggle(true); //Set the listing to visible (default)

    /**
     * If the player has been removed from the map (went offline) and is now back
     *
     * We wouldn't be here unless the player is now online, but we had already created
     * this player, and we don't want to re-create it because that would be wasteful :)
     */
    if (player.removed) {
        player.marker.setMap(overviewer.map); //Set the marker's map (google's way of enabling the marker)
        player.infoWindow.setMap(overviewer.map); //Set the infoWindow's map (again google's way)
        player.infoWindow.close(); //Close the infoWindow (google automaticly opens an InfoWindow when it's map is set)
    }
    player.removed = false; //The player is no longer removed
    $(player.listing).unbind('click'); //We unbind clicking on the <li> by default (for hidden players)

    /**
     *If the player's visibility is set to false (through the in-game /hide command)
     */
    if (!player.visible) {
        player.infoWindow.close(); //close the InfoWindow (incase it was open at the time)
        $(player.listing).empty().append(player.name+' (hidden)'); //Empty the <li> and re-insert the player with (hidden) instead of the coordinates
    } else if (showPlayerCoords) {
        $(player.listing).empty().append(player.name+' ('+Math.round(player.x)+','+Math.round(player.y)+','+Math.round(player.z)+')'); //Empty the <li> and re-insert the player with their in-game coordinates (rounding for prettyness)
        if (showPlayerMarkers) { // only show the info window if the markers are enabled.
            /**
             *We re-bind the click event only if they are visible
             *This prevents clicking on the <li> to get the player's last location and a pointless InfoWindow
             */
            $(player.listing).click(function(){
                player.infoWindow.open(overviewer.map,player.marker);
            });
        }
    } else {
        $(player.listing).empty().append(player.name); //Empty the <li> and re-insert the player
        if (showPlayerMarkers) { // only show the info window if the markers are enabled.
            /**
             *We re-bind the click event only if they are visible
             *This prevents clicking on the <li> to get the player's last location and a pointless InfoWindow
             */
            $(player.listing).click(function(){
                player.infoWindow.open(overviewer.map,player.marker);
            });
        }
    }
}

/**
 * Check the players for inactivity and remove them if not updated
 *
 * @return void
 */
function checkPlayers() {
    var timeout    =    new Date(new Date()-3000); //The timeout date object
    /**
     *Iterate over all known players to check for their last update
     */
    for (var i in playerMarkers) {
        var player    =    playerMarkers[i];
        /**
         *If the player has not updated within the timeout window
         *They need to be removed, but only if we haven't already removed them
         */
        if (player.updated<timeout && !player.removed) {
            removePlayer(player.name);
        }
    }
}

/**
 * Remove a player from the map
 *
 * @param    name    string    The name of the player
 * @return void
 */
function removePlayer(name) {
    var player    =    playerMarkers[name];
    player.infoWindow.close(); //close the InfoWindow (probably not needed, but let's be consistant)
    player.infoWindow.setMap(null); //Unlink the InfoWindow from the map
    player.marker.setMap(null); //Unlink the marker from the map
    $(player.listing).toggle(false); //Hide the player listing in the <ul>
    player.removed    =    true; //The player has been removed
}

/**
 *  Will build a URL based on the player's name.
 *
 *  @param    name    string    The name of the player
 *  @return    string
 */
function getAvatarURL(name){
    var out = avatarserver.replace('<playername>',name);
    return out;
}

setInterval(loadPlayers, 1000 * refreshTime);

/**
 * Wait until the document is fully loaded, then add the PlayerList Div on the right, if enabled
 */
$(function() {
	loadPlayers();

    if(showPlayerList) {
        
		var panel                      = document.createElement("DIV");
		panel.className					= "panel panel-default";
        panel.style.position           = 'absolute';
        panel.style.top                = '120px';
        panel.style.right              = '14px';
        panel.style.width              = '200px';


        var panel_header = document.createElement("DIV");
		panel_header.className			= "panel-heading";

        var panel_header_title = document.createElement("DIV");
		panel_header_title.className			= "panel-title";
        panel_header_title.innerHTML        = "<span class='glyphicon glyphicon-globe'></span> Players";
        panel_header.appendChild(panel_header_title);
        
        var panel_body = document.createElement("DIV");
        panel_body.className     = 'panel-body';
        
		var panel_body_players = document.createElement("UL");
		panel_body_players.className			= "list-unstyled";
        panel_body_players.id                   = "player_list";
        panel_body_players.style.marginBottom	= '0px';
        panel_body.appendChild(panel_body_players);

        panel.appendChild(panel_header);
        panel.appendChild(panel_body);

        document.body.appendChild(panel);
    }
});

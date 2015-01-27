var JSON_structures            =    'http://api.huitaplus.com/minecraft/structures';
var HOME_ICON			=	 'http://huitaplus.com/64571/icons/marker_town.png';
var structureMarkers       =    []; 


/**
 * Create a new Structure Marker
 *
 * @param    location    google.maps.LatLng    The initial location of the marker
 * @param    map            google.maps.Map        The map where the marker shoudl be displayed (the overviewer map)
 * @param    name        string                The name of the player
 * @param    icon        string                The image icon of the player
 * @param    visible        boolean                True if the marker should be displayed
 * @return    google.maps.Marker
 */
function createStructureMarker(map,item) {
    var marker =  new google.maps.Marker({
        position: item.location,
        map: map,
        title: item.name,
        icon: new google.maps.MarkerImage(item.icon),
        visible: true,
        zIndex: 999
    });
    return marker;
}


/**
 *  Create a new Informational Window for a Structure Marker
 *
 *  @param    name    string    The name of the player
 *  @return    goolge.maps.InfoWindow
 */
function CreateStructureInfoWindow(structure) {
    var html        = "<div style='line-height: 1.35;overflow: hidden;white-space: nowrap;'>";

	html += "<div style='width: 350px;'>";
	html += "<img class='img-thumbnail pull-left' style='margin:5px;width:160px' src='"+structure.thumbnail+"'/>";
	html += "<br><b>"+structure.name+"</b><br><br>";
	html += "<span>(X "+structure.x+"; Y "+structure.y+"; X "+structure.z+")</span><br>";
	html += "<span class='label label-default'>"+structure.date.toString().substr(0,10)+"</span>";
	html += "</div>";
	html += "</div>";

    var infoWindow  = new google.maps.InfoWindow({content: html});
    return infoWindow;
}

/**
 * Create a new Listener for the Marker
 *
 * @param    marker        google.maps.Marker
 * @param    infoWindow    google.maps.InfoWindow
 * @return    google.maps.event.MapEventListener
 */
function CreateStructureInfoWindowListener(marker,infoWindow) {
    var listener = google.maps.event.addListener(marker, 'click', function() {
        infoWindow.open(marker.getMap(),marker);
    });
    return listener;
}


/**
 * Load the players JSON file and update the map
 *
 * @return void
 */
function loadStructures() {
    $.ajax({
        url:JSON_structures,
        dataType: 'json',
        cache: false,
        success: function(data) {
            for (var i in data) {

				var item = data[i];
                var curTileSet = overviewer.mapView.options.currentTileSet;
				var world_name = curTileSet.get("world").get("name");

				var structure = {};

                structure.name            =    item.title;
                structure.x               =    item.x;
                structure.y               =    item.y;
                structure.z               =    item.z;
                structure.date		      =    new Date(item.date*1000);
                structure.icon            =    HOME_ICON;
                structure.location        =    overviewer.util.fromWorldToLatLng(item.x,item.y,item.z, curTileSet);
				structure.thumbnail	      =	   item.thumbnail;

				var marker      =    createStructureMarker(overviewer.map,structure); //create the marker
				var infoWindow  =    CreateStructureInfoWindow(structure); //create the info window
				var listener    =    CreateStructureInfoWindowListener(marker,infoWindow); //create the listener on the marker for the info window

				structureMarkers.push(structure);

            }
        }
    });
}


/**
 * Wait until the document is fully loaded, then add the StructureList Div on the right, if enabled
 */
$(function() {
	loadStructures();
});

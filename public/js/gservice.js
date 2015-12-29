
// Creates the gservice factory. This will be the primary means by which we interact with Google Maps
angular.module('gservice', [])
    .factory('gservice', function($rootScope, $http){

        // Initialize Variables
        // -------------------------------------------------------------
        // Service our factory will return
        var googleMapService = {};

        // Array of locations obtained from API calls
        var locations = [];

        // Selected Location (initialize to center of America)
        var selectedLat = 51.458417 ;
        var selectedLong = -2.602979;

        googleMapService.clickLat  = 0;
        googleMapService.clickLong = 0;

        var styles = [
            {"featureType":"administrative","elementType":"all",
                "stylers":
                    [{"visibility":"on"},{"lightness":33}]},
            {"featureType":"landscape","elementType":"all",
                "stylers":
                    [{"color":"#f2e5d4"}]},
            {"featureType":"poi.park","elementType":"geometry",
                "stylers":
                    [{"color":"#c5dac6"}]},
            {"featureType":"poi.park","elementType":"labels",
                "stylers":
                    [{"visibility":"on"},{"lightness":20}]},
            {"featureType":"road","elementType":"all",
                "stylers":
                    [{"lightness":20}]},
            {"featureType":"road.highway","elementType":"geometry",
                "stylers":[{"color":"#c5c6c6"}]},
            {"featureType":"road.arterial","elementType":"geometry",
                "stylers":
                    [{"color":"#e4d7c6"}]},
            {"featureType":"road.local","elementType":"geometry",
                "stylers":[{"color":"#fbfaf7"}]},
            {"featureType":"water","elementType":"all",
                "stylers":[{"visibility":"on"},{"color":"#acbcc9"}]},
            {"featureType":"poi.business",
                "stylers":[{"visibility":"off"}]}           
        ];
  
  var styledMap = new google.maps.StyledMapType(styles,
    {name: "Styled Map"});

        // Functions
        // --------------------------------------------------------------
        // Refresh the Map with new data. Function will take new latitude and longitude coordinates.
        googleMapService.refresh = function(latitude, longitude, filteredResults){

            // Clears the holding array of locations
            locations = [];

            // Set the selected lat and long equal to the ones provided on the refresh() call
            selectedLat = latitude;
            selectedLong = longitude;

            // If filtered results are provided in the refresh() call...
            if (filteredResults){

                // Then convert the filtered results into map points.
                locations = convertToMapPoints(filteredResults);

                // Then, initialize the map -- noting that a filter was used (to mark icons yellow)
                initialize(latitude, longitude, true);
            }

            // If no filter is provided in the refresh() call...
            else {
                initialize(latitude, longitude, false);
            }
        };

        // Private Inner Functions
        // --------------------------------------------------------------
        // Convert a JSON of users into map points
        var convertToMapPoints = function(response){

            // Clear the locations holder
            var locations = [];

            // Loop through all of the JSON entries provided in the response
            for(var i= 0; i < response.length; i++) {
                var crime = response[i];
                var losttype = "";
                var securityused = "";
                var partslost = "";
                var thiefs = "";
                var weapons = "";
                var violence = (crime.violenceused == false) ? 'no' : 'yes';
                var objDate = new Date(crime.event_at);
                var day = objDate.getDate();
                var month = objDate.getMonth()+1;
                var year = objDate.getFullYear();
                var hour = objDate.getHours()+1;
                var minute = objDate.getMinutes();
                if(crime.crimetype != 'robbery')
                {
                    losttype = '<br><b>Lost</b>: ' + crime.losttype;
                    securityused = '<br><b>Security</b>: ';

                    for(var j = 0; j< crime.securitytype.length; j++)
                    {
                        if(crime.securitytype[j] != null && crime.securitytype[j] != 'false')
                        {
                            securityused += crime.securitytype[j]+" ";
                        }
                    }

                    if(crime.losttype == 'partial')
                    {
                        partslost ='<br><b>Stolen Items</b>: ';

                        for(var j =0; j< crime.stolenparts.length; j++)
                        {
                            if(crime.stolenparts[j] != null && crime.stolenparts[j] != 'false')
                            {
                                partslost += crime.stolenparts[j]+" ";
                            }
                        }
                    }
                    if(crime.violenceused)
                    {
                        thiefs = '<br><b>Thieves: </b> ' + crime.numberthiefs;
                        weapons = '<br><b>Weapons: </b> ';
                        for(var j =0; j< crime.weaponsused.length; j++)
                        {                   
                            if(crime.weaponsused[j] != null && crime.weaponsused[j] != 'false')
                            {
                                weapons += crime.weaponsused[j]+" ";
                            }
                        }                        
                    }
                }
                
                // Create popup windows for each record
                var  contentString =
                    '<p><b>Type</b>: ' + crime.crimetype +
                     losttype+
                    '<br><b>Violence</b>: ' + violence +
                    thiefs+
                    weapons+
                    '<br><b>Date and Time</b>: ' +  year+"-"+month+"-"+day+", Aprox at:"+hour+":"+minute;
                    securityused+
                    partslost+
                    '</p>';

            // Converts each of the JSON records into Google Maps Location format (Note [Lat, Lng] format).
            locations.push({
                latlon: new google.maps.LatLng(crime.eventlocation[1], crime.eventlocation[0]),
                message: new google.maps.InfoWindow({
                        content: contentString,
                        maxWidth: 320
                        }),
                crimetype: crime.crimetype,
                losttype: crime.losttype,
                violenceused: crime.violenceused,
                event_at: crime.event_at
            });
    }
        // location is now an array populated with records in Google Maps format
        return locations;
    };

// Initializes the map
var initialize = function(latitude, longitude, filter) {

    var bounds = new google.maps.LatLngBounds();

    // Uses the selected lat, long as starting point
    var myLatLng = {lat: selectedLat, lng: selectedLong};

    // If map has not been created already...
    if (!map){

        // Create a new map and place in the index.html page
        var map = new google.maps.Map(document.getElementById('map'), {
            zoom: 15
        });

             //Associate the styled map with the MapTypeId and set it to display.
     map.mapTypes.set('map_style', styledMap);
     map.setMapTypeId('map_style');
    }
    
    // Loop through each location in the array and place a marker
    if(filter)
    {
        locations.forEach(function(n, i){

            if(n.crimetype == 'bike')
            {
                icon = '../images/bike.png';
            }else if(n.crimetype == 'car'){
                icon = '../images/car.png';
            }
            else
            {
                icon = '../images/theft.png';
            }

            bounds.extend(n.latlon);

            var marker = new google.maps.Marker({
                position: n.latlon,
                map: map,
                title: "Big Map",
                icon: icon
            });

            // For each marker created, add a listener that checks for clicks
            google.maps.event.addListener(marker, 'click', function(e){

                // When clicked, open the selected marker's message
                currentSelectedMarker = n;
                n.message.open(map, marker);
            });
        });
    }
    else
    {
        locations = [];
    }
    curricon = "http://maps.google.com/mapfiles/ms/micons/man.png";
    // Set initial location as a bouncing red marker
    var initialLocation = new google.maps.LatLng(latitude, longitude);
    var marker = new google.maps.Marker({
        position: initialLocation,
        animation: google.maps.Animation.BOUNCE,
        map: map,
        draggable: true,
        icon: curricon
    });
    lastMarker = marker;

    bounds.extend(initialLocation);
    // Function for moving to a selected location
    map.panTo(new google.maps.LatLng(latitude, longitude));

    // Clicking on the Map moves the bouncing red marker
    google.maps.event.addListener(map, 'click', function(e){
        var marker = new google.maps.Marker({
            position: e.latLng,
            animation: google.maps.Animation.BOUNCE,
            map: map,
            draggable: true,
            icon: curricon
        });

        bounds.extend(e.latLng);
        // When a new spot is selected, delete the old red bouncing marker
        if(lastMarker){
            lastMarker.setMap(null);
        }

        // Create a new red bouncing marker and move to it
        lastMarker = marker;
        map.panTo(marker.position);
        // Update Broadcasted Variable (lets the panels know to change their lat, long values)
        googleMapService.clickLat = marker.getPosition().lat();
        googleMapService.clickLong = marker.getPosition().lng();
        $rootScope.$broadcast("clicked");

    });

    map.fitBounds (bounds);
    map.setCenter(bounds.getCenter());
    if(locations.length == 0)
    {
        map.setZoom(15);
    }
    else
    {
        map.setZoom(map.getZoom()-1);
    }


};

// Refresh the page upon window load. Use the initial latitude and longitude
google.maps.event.addDomListener(window, 'load',
    googleMapService.refresh(selectedLat, selectedLong));

return googleMapService;
});


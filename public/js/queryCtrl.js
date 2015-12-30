// Creates the addCtrl Module and Controller. Note that it depends on 'geolocation' and 'gservice' modules.
var queryCtrl = angular.module('queryCtrl', ['geolocation', 'gservice', 'ui-rangeSlider', 'ui.bootstrap']);

queryCtrl.directive('googleplace', function() {
    return {
        require: 'ngModel',
        link: function(scope, element, attrs, model) {
            var options = {
                types: ['geocode'],
            };
            scope.gPlace = new google.maps.places.Autocomplete(element[0], options);

            google.maps.event.addListener(scope.gPlace, 'place_changed', function() {
                var place = scope.gPlace.getPlace();
                var details = place.geometry && place.geometry.location ? {
                        latitude: place.geometry.location.lat(),
                        longitude: place.geometry.location.lng()
                    } : {};

                scope.$apply(function() {
                    if(place.geometry)
                    {
                        scope.formData.latitude = place.geometry.location.lat();
                        scope.formData.longitude = place.geometry.location.lng();  
                        scope.queryCrimes();
                    }              
                });
            });
        }
    };
});

queryCtrl.controller('queryCtrl', function($scope, $log, $http, $rootScope, geolocation, gservice){

    // Initializes Variables
    // ----------------------------------------------------------------------------
    $scope.formData = {};
    var queryBody = {};
    var coords = {};
    var lat = 0;
    var long = 0;

// set available range
$scope.minDistance = 0;
$scope.maxDistance = 100;

// default the user's values to the available range
$scope.userMin = 0;
$scope.formData.distance = 10;
    // Functions
    // ----------------------------------------------------------------------------

    // Get User's actual coordinates based on HTML5 at window load
    geolocation.getLocation().then(function(data){
        coords = {lat:data.coords.latitude, long:data.coords.longitude};

        // Set the latitude and longitude equal to the HTML5 coordinates
        $scope.formData.longitude = parseFloat(coords.long).toFixed(3);
        $scope.formData.latitude = parseFloat(coords.lat).toFixed(3);
                // Assemble Query Body
        // Assemble Query Body
        queryBody = {
            longitude:  parseFloat($scope.formData.longitude),
            latitude:   parseFloat($scope.formData.latitude),
            distance:   $scope.formData.distance
        };

        // Post the queryBody to the /query POST route to retrieve the filtered results
        $http.post('/query', queryBody)

            // Store the filtered results in queryResults
            .success(function(queryResults){

                // Count the number of records retrieved for the panel-footer
                $scope.queryCount = queryResults.length;
                gservice.refresh(queryBody.latitude, queryBody.longitude, queryResults);
            })
            .error(function(queryResults){
                console.log('Error ' + queryResults);
            })
        //gservice.refresh($scope.formData.latitude, $scope.formData.longitude, true);
    });

    // Get coordinates based on mouse click. When a click event is detected....
    $rootScope.$on("clicked", function(){

        // Run the gservice functions associated with identifying coordinates
        $scope.$apply(function(){
            $scope.formData.latitude = parseFloat(gservice.clickLat).toFixed(3);
            $scope.formData.longitude = parseFloat(gservice.clickLong).toFixed(3);
        });
    });

    $rootScope.$on("dragged", function(){

        // Run the gservice functions associated with identifying coordinates
        $scope.$apply(function(){
            $scope.formData.latitude = parseFloat(gservice.clickLat).toFixed(3);
            $scope.formData.longitude = parseFloat(gservice.clickLong).toFixed(3);
        });
    });

  //----------------CHECK BOXES-------------------------
    $scope.onCheckBoxSelected=function() {
        if(($scope.formData.bike == false || $scope.formData.bike == undefined ) && ($scope.formData.car == false || $scope.formData.car == undefined) && $scope.formData.robbery == 'robbery')
        {
            $scope.formData.total = false;
            $scope.formData.partial = false;
        }
    };

    // Take query parameters and incorporate into a JSON queryBody
    $scope.queryCrimes = function(){

        // Assemble Query Body
        queryBody = {
            longitude:  parseFloat($scope.formData.longitude),
            latitude:   parseFloat($scope.formData.latitude),
            distance:   parseFloat($scope.formData.distance),
            //type
            bike:       $scope.formData.bike,
            car:        $scope.formData.car,
            robbery:    $scope.formData.robbery,
            //lost type
            total:      $scope.formData.total,
            partial:    $scope.formData.partial,
            //violence
            violenceyes: $scope.formData.violenceyes,
            violenceno: $scope.formData.violenceno 
        };

        // Post the queryBody to the /query POST route to retrieve the filtered results
        $http.post('/query', queryBody)

            // Store the filtered results in queryResults
            .success(function(queryResults){

                // Count the number of records retrieved for the panel-footer
                $scope.queryCount = queryResults.length; 
                gservice.refresh(queryBody.latitude, queryBody.longitude, queryResults);
            })
            .error(function(queryResults){
                console.log('Error ' + queryResults);
            })
    };
});

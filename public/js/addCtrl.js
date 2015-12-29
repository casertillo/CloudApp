
// Creates the addCtrl Module and Controller. Note that it depends on the 'geolocation' module and service.
var addCtrl = angular.module('addCtrl', ['geolocation', 'gservice', 'ui.bootstrap']);

addCtrl.directive('match', function($parse) {
  return {
    require: 'ngModel',
    link: function(scope, elem, attrs, ctrl) {
      scope.$watch(function() {        
        return $parse(attrs.match)(scope) === ctrl.$modelValue;
      }, function(currentValue) {
        ctrl.$setValidity('mismatch', currentValue);
      });
    }
  };
});

addCtrl.directive('onlyNum', function() {
  return {
    require: 'ngModel',
    link: function (scope, element, attr, ngModelCtrl) {
      function fromUser(text) {
        var transformedInput = text.replace(/[^0-9]/g, '');
        console.log(transformedInput);
        if(transformedInput !== text) {
            ngModelCtrl.$setViewValue(transformedInput);
            ngModelCtrl.$render();
        }
        return transformedInput;  // or return Number(transformedInput)
      }
      ngModelCtrl.$parsers.push(fromUser);
    }
  }; 
});

angular.module('addCtrl').controller('ModalInstanceCtrl', function ($scope, $uibModalInstance) {

  $scope.ok = function () {
    $uibModalInstance.close('yes');
  };

  $scope.cancel = function () {
    $uibModalInstance.dismiss('cancel');
  };
});

angular.module('addCtrl').controller('ModalThanksCtrl', function ($scope, $uibModalInstance) {

  $scope.ok = function () {
    $uibModalInstance.close('yes');
  };
});

addCtrl.controller('addCtrl', function($scope, $http, $rootScope, geolocation, gservice, $uibModal, $window){


    // Initializes Variables
    // ----------------------------------------------------------------------------
    $scope.formData = {};
    var coords = {};
    var lat = 0;
    var long = 0;

    // Get User's actual coordinates based on HTML5 at window load
geolocation.getLocation().then(function(data){

    // Set the latitude and longitude equal to the HTML5 coordinates
    coords = {lat:data.coords.latitude, long:data.coords.longitude};

    // Display coordinates in location textboxes rounded to three decimal points
    $scope.formData.longitude = parseFloat(coords.long).toFixed(3);
    $scope.formData.latitude = parseFloat(coords.lat).toFixed(3);

    // Display message confirming that the coordinates verified.
    //$scope.formData.htmlverified = "Yep (Thanks for giving us real data!)";

    gservice.refresh($scope.formData.latitude, $scope.formData.longitude, false);

});

//-------DATE AND TIME-------------------------------------------
  // $scope.today = function() {
  //   $scope.formData.dt = new Date();
  // };
  // $scope.today();

  $scope.clear = function () {
    $scope.formData.dt = null;
  };

  $scope.maxDate = new Date();
  $scope.minDate = new Date(2000, 1, 1);

  $scope.open = function($event) {
    $scope.status.opened = true;
  };

  $scope.setDate = function(year, month, day) {
    $scope.formData.dt = new Date(year, month, day);
  };

  $scope.dateOptions = {
    formatYear: 'yy',
    startingDay: 1
  };

  $scope.format = 'yyyy/MM/dd';

  $scope.status = {
    opened: false
  };

  var tomorrow = new Date();
  tomorrow.setDate(tomorrow.getDate() + 1);
  var afterTomorrow = new Date();
  afterTomorrow.setDate(tomorrow.getDate() + 2);

  $scope.events =
    [
      {
        date: tomorrow,
        status: 'full'
      },
      {
        date: afterTomorrow,
        status: 'partially'
      }
    ];

  $scope.getDayClass = function(date, mode) {
    if (mode === 'day') {
      var dayToCheck = new Date(date).setHours(0,0,0,0);

      for (var i=0;i<$scope.events.length;i++){
        var currentDay = new Date($scope.events[i].date).setHours(0,0,0,0);

        if (dayToCheck === currentDay) {
          return $scope.events[i].status;
        }
      }
    }

    return '';
  };
  $scope.formData.time = new Date();
  $scope.hstep = 1;
  $scope.mstep = 15;
  //----------------------------------------------------
  //----------------CHECK BOXES-------------------------
    $scope.onCheckBoxSelected=function() {
        $scope.anySelected = false;
        for(var key in $scope.formData.stolencar){
            if($scope.formData.stolencar[key]){
                $scope.anySelected=true;
            }
        }
    };

    $scope.onCheckCarSecuritySelected=function() {
        $scope.anyCarSecuritySelected = false;
        for(var key in $scope.formData.carsecurity){
            if($scope.formData.carsecurity[key]){
                $scope.anyCarSecuritySelected=true;
            }
        }
    };

    $scope.onCheckBikeSelected=function() {
        $scope.anybikeSelected = false;
        for(var key in $scope.formData.stolenbike){
            if($scope.formData.stolenbike[key]){
                $scope.anybikeSelected=true;
            }
        }
    };

    $scope.onCheckBikeSecuritySelected=function() {
        $scope.anyBikeSecuritySelected = false;
        for(var key in $scope.formData.bikesecurity){
            if($scope.formData.bikesecurity[key]){
                $scope.anyBikeSecuritySelected=true;
            }
        }
    };

    //----------------------------------------------------

    //------------VIOLENCE USED---------------------------
        $scope.onCheckWaponSelected=function() {
          console.log("entre");
        $scope.anyWaponSelected = false;
        for(var key in $scope.formData.weapons){
            if($scope.formData.weapons[key]){
                $scope.anyWaponSelected=true;
            }
        }
    };
    //----------------------------------------------------
    // Set initial coordinates to the center of the US
    $scope.formData.latitude = 39.500;
    $scope.formData.longitude = -98.350;
    
    // Functions
    // ----------------------------------------------------------------------------
    // Creates a new user based on the form fields

    // Get coordinates based on mouse click. When a click event is detected....
    $rootScope.$on("clicked", function(){

        // Run the gservice functions associated with identifying coordinates
        $scope.$apply(function(){
            $scope.formData.latitude = parseFloat(gservice.clickLat).toFixed(3);
            $scope.formData.longitude = parseFloat(gservice.clickLong).toFixed(3);
            $scope.formData.htmlverified = "Nope (Thanks for spamming my map...)";
        });
    });

  $scope.openconfirm = function (size) {

    var modalInstance = $uibModal.open({
      animation: $scope.animationsEnabled,
      templateUrl: 'myModalContent.html',
      controller: 'ModalInstanceCtrl',
      size: size,
      resolve: {
        items: function () {
          return $scope.answer;
        }
      }
    });
      modalInstance.result.then(function (selectedItem) {
        if(selectedItem)
        {
          var date = new Date($scope.formData.dt)
          var time = new Date($scope.formData.time);
          var event_date = new Date(date.getFullYear(), date.getMonth(), date.getDate(), time.getHours(),time.getMinutes(), 00, 00);
          var crimeData = {};
          var parts = [];
          var security = [];
          var thiefs = 0;
          var weapons = [];
          var lost = '';
            //Grabs all of the text box fields
          //CRIME DATA FOR BIKES
          if($scope.formData.crimetype == 'bike')
          {
            if($scope.formData.losttype == 'partial')
            {
              lost = 'partial';
              parts = [$scope.formData.stolenbike.bikefront, $scope.formData.stolenbike.bikeback, $scope.formData.stolenbike.bikeseat, $scope.formData.stolenbike.bikeother];
            }
            else
            {
              lost = 'total';
            }
            security = [$scope.formData.bikesecurity.bikeudlock, $scope.formData.bikesecurity.bikechain, $scope.formData.bikesecurity.bikecable, $scope.formData.bikesecurity.bikewheellock, $scope.formData.bikesecurity.bikeothersecurity];
          }      
          //CRIME DATA FOR CARS
          else if($scope.formData.crimetype == 'car')
          {
            if($scope.formData.losttype == 'partial')
            {
              lost = 'partial';
              parts = [$scope.formData.stolencar.carwheels, $scope.formData.stolencar.carmirrors, $scope.formData.stolencar.carpersonal, $scope.formData.stolencar.carstereo, $scope.formData.stolencar.carother];
            }
            else
            {
              lost = 'total';
            }
            security = [$scope.formData.carsecurity.caralarm, $scope.formData.carsecurity.carnuts, $scope.formData.carsecurity.carother];
          }

          //GENERAL VIOLENCE
          if($scope.formData.violence == 'true')
          {
            thiefs = $scope.formData.thiefs;
            weapons = [$scope.formData.weapons.colweapon, $scope.formData.weapons.fireweapon, $scope.formData.weapons.forceviolence, $scope.formData.weapons.noneviolence];
          }

          crimeData = {
            crimetype: $scope.formData.crimetype,
            losttype: lost,

            stolenparts: parts,
            securitytype: security,
            
            violenceused: $scope.formData.violence,
            
            numberthiefs: thiefs,
            weaponsused:weapons,
            
            event_at: event_date,
            eventlocation:[$scope.formData.longitude, $scope.formData.latitude]
          };
          datasend={
            crime : crimeData,
            email : $scope.formData.email
          }
            // Saves the user data to the db
          $http.post('/crimes', datasend)
            .success(function (data) {
              console.log(JSON.stringify(data,null, 4));
              var modalInstance = $uibModal.open({
                animation: $scope.animationsEnabled,
                templateUrl: 'myModalThanks.html',
                controller: 'ModalThanksCtrl',
                size: size,
                resolve: {
                  items: function () {
                    return $scope.answer;
                  }
                }
              });
               modalInstance.result.then(function (selectedItem) {
                  $window.location.href = '#/find';
               }, function(){
                  $window.location.href = '#/find';
               });
            })
            .error(function (data) {
                console.log('Error: ' + data);
            });
        }
        
    });

  };
});

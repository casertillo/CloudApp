// Creates the addCtrl Module and Controller. Note that it depends on 'geolocation' and 'gservice' modules.
var queryCtrl = angular.module('confirmCtrl', ['ui.bootstrap']);
queryCtrl.controller('confirmCtrl', function($scope, $http, $routeParams){

    $scope.confirmid = $routeParams.confirmid;

        queryBody = {
            idreq:  $routeParams.confirmid
        };

    $http.post('/confirm', queryBody)

        // Store the filtered results in queryResults
        .success(function(queryResults){

            if(queryResults == 'nothing')
            {
                $scope.alert = 'danger';
                $scope.msg = 'Invalid or Expired confirmation.';
            }
            else
            {
                $scope.alert = 'success';
                $scope.msg = 'Thanks for confirm!';
            }
                // Count the number of records retrieved for the panel-footer
            $scope.confirmid = queryResults; 
        })
        .error(function(queryResults){
            console.log('Error ' + queryResults);
        })
});

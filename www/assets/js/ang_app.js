//Define an angular module for our app
var app = angular.module('mobile', ['ui-rangeSlider', 'ngTouch']);

app.controller('mobileController', function($scope, $http) {

    url_base = 'http://192.168.1.23/em_project';

    if(localStorage.getItem('user')){
        $scope.user = JSON.parse(localStorage.getItem('user'));
    }

    $scope.post = {
        'type' : 'touristique',
        'duree' : {
            min: 0,
            max: 10
        },
        'distance' : {
            min: 0,
            max: 100
        },
        'transportT' : 'WALKING',
        'parcoursTypeT' : 'economique',
        'difficulteT' : 1,
        'payant' : 0
    };

    $scope.inscr = {};

    $scope.debbug = function() {
        console.log($scope.post);
    };

    $scope.search = function() {

        var postData = 'mySearch='+JSON.stringify($scope.post);

        $http({
            method : 'POST',
            url : url_base + '/ajax/search',
            data: postData,
            headers : {'Content-Type': 'application/x-www-form-urlencoded'}

        }).success(function(res){
            $scope.resultats = res;
        }).error(function(error){
            console.log(error);
        });
    };

    $scope.sigin = function() {
        $scope.inscr.travail = document.getElementById('travail').value;


        var geocoder = new google.maps.Geocoder();

        geocoder.geocode({
            "address": $scope.inscr.travail
        }, function(results, status) {

            if( status == google.maps.GeocoderStatus.OK ) {
                $scope.inscr.latlong = results[0].geometry.location.k + ', ' + results[0].geometry.location.B;

                var postData = 'myForm='+JSON.stringify($scope.inscr);

                $http({
                    method : 'POST',
                    url : url_base + '/ajax/inscription',
                    data: postData,
                    headers : {'Content-Type': 'application/x-www-form-urlencoded'}

                }).success(function(res){

                    $scope.error = res.error;

                    if($scope.error == 'inscrit'){
                        $scope.user = {};
                        $scope.user.email = $scope.inscr.email;
                        $scope.user.ges = 0;
                        $scope.user.latlong = $scope.inscr.latlong;

                        aLatLong = $scope.user.latlong.split(', ');
                        lat = aLatLong[0];
                        long = aLatLong[1];

                        var geocoder = new google.maps.Geocoder();
                        var latlng = new google.maps.LatLng(lat, long);

                        geocoder.geocode({
                            "latLng": latlng
                        }, function(results, status) {
                            console.log(latlng);
                            console.log($scope.user.latlong);
                            console.log(results[0].formatted_address);
                            $scope.user.workaddress = results[0].formatted_address;

                            localStorage.setItem('user', JSON.stringify($scope.user));
                        });
                        $.mobile.changePage('#home');
                    }

                }).error(function(error){
                    console.log(error);
                });
            }
            else
            {
                $scope.error = 'adresse';
            }
        });



    };

    $scope.connection = function() {

        var postData = 'myForm='+JSON.stringify($scope.co);

        $http({
            method : 'POST',
            url : url_base + '/ajax/connection_mobile',
            data: postData,
            headers : {'Content-Type': 'application/x-www-form-urlencoded'}

        }).success(function(res){
            $scope.error = res.error;

            if(!$scope.error){

                $scope.user = {};
                $scope.user.email = res.email;
                $scope.user.ges = res.ges;
                $scope.user.latlong = res.travail;

                aLatLong = $scope.user.latlong.split(', ');
                lat = aLatLong[0];
                long = aLatLong[1];

                var geocoder = new google.maps.Geocoder();
                var latlng = new google.maps.LatLng(lat, long);

                geocoder.geocode({
                    "latLng": latlng
                }, function(results, status) {
                    console.log(latlng);
                    console.log($scope.user.latlong);
                    console.log(results[0].formatted_address);
                    $scope.user.workaddress = results[0].formatted_address;

                    localStorage.setItem('user', JSON.stringify($scope.user));
                });

                $.mobile.changePage('#home');
            }

        }).error(function(error){
            console.log(error);
        });



    };

    $scope.gotoiti = function(resultat) {
        $scope.resultat = resultat;

        $.mobile.changePage('#parcoursItin');
    };

});
//Define an angular module for our app
var app = angular.module('mobile', ['ui-rangeSlider', 'ngTouch']);

app.controller('mobileController', function($scope, $http, $timeout) {


    url_base = 'http://gomobility:8888';


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

    $scope.search = function(type) {

        $scope.post.type = type;

        var postData = 'mySearch='+JSON.stringify($scope.post);

        $http({
            method : 'POST',
            url : url_base + '/ajax/search',
            data: postData,
            headers : {'Content-Type': 'application/x-www-form-urlencoded'}

        }).success(function(res){
            $scope.resultats = res;
            getDataMap(res);
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

                            $timeout(function(){
                                $scope.user.workaddress = results[0].formatted_address;
                                localStorage.setItem('user', JSON.stringify($scope.user));
                            },0);
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

                    $timeout(function(){
                        $scope.user.workaddress = results[0].formatted_address;
                        localStorage.setItem('user', JSON.stringify($scope.user));
                    },0);
                });

                $.mobile.changePage('#home');
            }

        }).error(function(error){
            console.log(error);
        });



    };

    $scope.gotosearch = function(resultat) {
        $scope.resultat = resultat;
        $.mobile.changePage('#mapsearch');
    };



    $scope.timeConvertion = function(tpsMin){
        var dureeH = Math.floor(tpsMin / 60);

        if(dureeH !==0){
            if(tpsMin < 10){
                dureeHM = dureeH + "h0" + tpsMin ;
            }else {
                dureeHM = dureeH + "h" + tpsMin ;
            }

        } else {
            dureeHM = tpsMin + "m";
        }

        return dureeHM;
    };

    $scope.gotosearch = function(resultat) {
        $scope.resultat = resultat;

        geocodeAdd($scope.resultat.start , 'start');
        geocodeAdd($scope.resultat.arrival , 'arrival');

        $.mobile.changePage('#mapsearch');
    };



    $scope.timeConvertion = function(tpsMin){
        var dureeH = Math.floor(tpsMin / 60);
        var dureeM = tpsMin % 60;
        var dureeHM;

        if(dureeH !==0){
            if(dureeM < 10){
                dureeHM = dureeH + "h0" + dureeM ;
            }else {
                dureeHM = dureeH + "h" + dureeM ;
            }

        } else {
            dureeHM = dureeM + "m";
        }

        return dureeHM;
    };


    $scope.gesConvertion = function(totalM){

        var GES = totalM/1000;

        if(GES < 1000) {
            GES = Math.round(GES*100)/100;
            gesContent = GES + ' g';
        } else {
            GES = GES /1000;
            GES = Math.round(GES*100)/100;
            gesContent = GES + ' kg';
        }

        return gesContent;
    };



    $scope.kmConvertion = function(totalM){

        var distanceKm = totalM / 1000;
        var kmFormat = distanceKm.toFixed(1) + " km";
        return kmFormat;
    };


    // format latLong : "lat, long"
    geocodeAdd = function(latLong, point){

        var addresse = "";
        aLatLong = latLong.split(', ');
        lat = aLatLong[0];
        long = aLatLong[1];

        var geocoder = new google.maps.Geocoder();
        var latlng = new google.maps.LatLng(lat, long);

        geocoder.geocode({
            "latLng": latlng
        }, function(results, status) {

            $timeout(function(){
                if(point == 'start'){

                    $scope.resultat.startAddress = results[0].formatted_address;

                }else{
                    $scope.resultat.arrivalAddress = results[0].formatted_address;
                }

            },0);


        });

    };



    $scope.save = function(){
        bilan = JSON.parse(localStorage.getItem('bilan'));
        bilan.type = $scope.bilan.type;
        bilan.email = JSON.parse(localStorage.getItem('user')).email;

        var postData = 'myForm='+JSON.stringify(bilan);

        $http({
            method : 'POST',
            url : url_base + '/ajax/savebilan',
            data: postData,
            headers : {'Content-Type': 'application/x-www-form-urlencoded'}

        }).success(function(res){



            localUser = JSON.parse(localStorage.getItem('user'));
            localUser.ges = localUser.ges + Math.round(bilan.ges);
            localStorage.setItem('user', JSON.stringify(localUser));

            $scope.user.ges = localUser.ges + Math.round(bilan.ges)

        }).error(function(error){
            console.log(error);
        });
    };


});
angular.module('app.controllers')
    .controller('MainCtrl', MainCtrl);

function MainCtrl($scope, $window, leafletData, DataService, MapService) {
    var main = this,
        _dataService = DataService,
        _mapService = MapService;

    main.appName = "In My Backyard";
    main.sidebarActive = false;
    main.speechSupported = $window.speechSynthesis;
    main.layers = _mapService.getBaseLayers();
    main.items = _dataService.getItems();
    main.markers = _dataService.getMarkers();
    main.maxbounds = _mapService.getMaxBounds();
    main.center = _mapService.getCenter();
    main.defaults = _mapService.getDefaults();

    var tour = new Tour({
        steps: _dataService.getTourSteps()
    });

    tour.init();

    main.startTour = function() {
        if (tour.ended()) {
            tour.restart();
        } else {
            tour.start();
        }
    }


    main.displaySummary = function(item) {
        main.sidebarActive = false;
        _mapService.zoomToPoint(leafletData, item);

        main.selectedItemId = item.marker.id;
        main.name = item.name;
        main.link = item.link;
        main.description = item.description;

        tour.next();
    };

    main.toggleSideNav = function() {
        main.sidebarActive = !main.sidebarActive;
    }

    main.speak = function() {
        responsiveVoice.speak(main.description);
    }

    main.stop = function() {
        if (responsiveVoice.isPlaying()) {
            responsiveVoice.cancel();
        }
    }

    $scope.$on('leafletDirectiveMarker.click', function(e, args) {
        var id = args.model.id;

        var facility = null;
        for (var j = 0; j < main.items.length; ++j) {
            if (main.items[j].marker.id === id) {
                facility = main.items[j];
                break; //dance
            }
        }

        main.displaySummary(facility);

    });

    if ($window.navigator.geolocation) {

        $window.navigator.geolocation.watchPosition(function(position) {

            for (var i = 0; i < main.items.length; i++) {
                var distanceToItem = _mapService.getDistanceFromLatLonInKm(position.coords.latitude, position.coords.longitude, main.items[i].marker.lat, main.items[i].marker.lng);
                if (distanceToItem <= 1) {
                    main.displaySummary(main.items[i]);
                }
            }
        });
    }


};

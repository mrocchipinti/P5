function point(name, lat, long) {
    this.name = name;
    this.lat = lat;
    this.long = long;
}

var map;// = new google.maps.Map();

var markers = [];
var selectedMarker;


function initialize() {
    if (typeof google == 'undefined') {
        $('#map-canvas').html('<h2>There are errors when retrieving map data.</h2><h2>Please try refresh page later.</h2>');
    }

    map = new google.maps.Map(document.getElementById('map-canvas'), {
        zoom: 15,
        center: { lat: 27.950575, lng: -82.457178 }
    });

    loadMarkers();
    refreshMarkersToMap();
}

function loadMarkers() {
    // Load all pre-defined points
    viewModel.points.push(new point('Hillsborough County Courthouse', 27.949952, -82.453467));
    viewModel.points.push(new point('Oaklawn Cemetery', 27.954351, -82.457328));
    viewModel.points.push(new point('Powerhouse Gym', 27.950685, -82.448401));
    viewModel.points.push(new point('Centro Asturiano De Tampa', 27.962099, -82.450982));
    viewModel.points.push(new point('Metropolitan Ministries', 27.963267, -82.459637));
    viewModel.points.push(new point('The Salvation Army', 27.959196, -82.459739));
    viewModel.points.push(new point('Glazer Children\'s Museum', 27.949435, -82.461442));
}

function refreshMarkersToMap() {
    // Delete all old markers
    for (var i = 0 ; i < markers.length; i++) {
        markers[i].setMap(null);
    }
    markers = [];

    // Add markers to map
    for (var i = 0 ; i < viewModel.points().length; i++) {
        var marker = new google.maps.Marker({
            position: new google.maps.LatLng(viewModel.points()[i].lat, viewModel.points()[i].long),
            title: viewModel.points()[i].name,
            map: map
        })

        markers.push(marker);

        attachEventListener(marker, marker.title)
    }
}

// When map marker is click, show wiki links
function attachEventListener(marker, title) {
    google.maps.event.addListener(marker, 'click', function () {
        loadWikiData(title);
    });
}

function clearMarkers() {
    viewModel.points.removeAll();
}

var viewModel = {
    points: ko.observableArray([]),
    markerFilter: ko.observable(),

    // When a point it clicked, show wiki links
    pointClicked: function (point) {
        loadWikiData(point.name);
    },

    // When a filter value is entered, filter marker list
    markerFilterChanged: function () {
        var filterValue = this.markerFilter();

        // Clear and re-load all points
        clearMarkers();
        loadMarkers();

        // Filter list
        var filteredList = ko.utils.arrayFilter(this.points(), function (item) {
            return item.name.indexOf(filterValue) !== -1;
        });

        this.points(filteredList);

        // Add filtereted points back to map
        refreshMarkersToMap();
    }
};

function loadWikiData(markerName) {
    var $wikiElem = $('#wikipedia-links');

    // clear out old data before new request
    $wikiElem.text("");

    var wikiUrl = 'http://en.wikipedia.org/w/api.php?action=opensearch&search=' + markerName + '&format=json&callback=wikiCallback';

    // Show failure message is wikipedia is not available
    var wikiRequestTimeout = setTimeout(function () {
        $wikiElem.text("failed to get wikipedia resources");
    }, 8000);

    // Get wiki pages and display links to them
    $.ajax({
        url: wikiUrl,
        dataType: "jsonp",
        success: function (response) {
            var articleList = response[1];

            for (var i = 0; i < articleList.length; i++) {
                articleStr = articleList[i];
                var url = 'http://en.wikipedia.org/wiki/' + articleStr;
                $wikiElem.append("<li><a target='wiki' href='" + url + "'>" + articleStr + "</a></li>");

            };

            clearTimeout(wikiRequestTimeout);
        }
    });

    return false;
};

$(document).ready(function () {
    ko.applyBindings(viewModel);
    initialize();
});
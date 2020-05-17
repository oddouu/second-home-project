let inputLatLng = $('#input-map');
let inputLat = $('#input-lat');
let inputLng = $('#input-lng');



// AUTOCOMPLETE CODE

(function () {
  var placesAutocomplete = places({
    appId: "plGMYT804R6Q",
    apiKey: "0d1f1cf006a8fd8eaf5421fdbe89e01d",
    container: document.querySelector("#input-map"),
    style: false,
  });


  // MAP CODE

  var map = L.map('map-example-container', {
    scrollWheelZoom: false,
    zoomControl: false
  });

  var osmLayer = new L.TileLayer(
    'https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', {
      minZoom: 1,
      maxZoom: 13,
      attribution: 'Map data © <a href="https://openstreetmap.org">OpenStreetMap</a> contributors'
    }
  );

  var markers = [];

  map.setView(new L.LatLng(0, 0), 1);
  map.addLayer(osmLayer);

  placesAutocomplete.on('suggestions', handleOnSuggestions);
  placesAutocomplete.on('cursorchanged', handleOnCursorchanged);
  placesAutocomplete.on('change', handleOnChange);
  placesAutocomplete.on('clear', handleOnClear);

  function handleOnSuggestions(e) {
    markers.forEach(removeMarker);
    markers = [];

    if (e.suggestions.length === 0) {
      map.setView(new L.LatLng(0, 0), 1);
      return;
    }

    e.suggestions.forEach(addMarker);
    findBestZoom();
  }

  function handleOnChange(e) {
    markers
      .forEach(function (marker, markerIndex) {
        if (markerIndex === e.suggestionIndex) {
          markers = [marker];
          marker.setOpacity(1);
          findBestZoom();

          // DOM MANIPULATION ON CHANGE - ADDS LAT AND LONG TO HTML

          const lat = markers[0]._latlng.lat;
          console.log("lat: ", lat);
          const lng = markers[0]._latlng.lng;
          console.log("lng: ", lng);
          //changes html with inputted coordinates
          inputLat
            .attr({
              'value': lat,
              'lat': lat
            });

          inputLng
            .attr({
              'value': lng,
              'lng': lng
            });




        } else {
          removeMarker(marker);
        }
      });
  }

  function handleOnClear() {
    map.setView(new L.LatLng(0, 0), 1);
    markers.forEach(removeMarker);
  }

  function handleOnCursorchanged(e) {
    markers
      .forEach(function (marker, markerIndex) {
        if (markerIndex === e.suggestionIndex) {
          marker.setOpacity(1);
          marker.setZIndexOffset(1000);
        } else {
          marker.setZIndexOffset(0);
          marker.setOpacity(0.5);
        }
      });
  }

  function addMarker(suggestion) {
    var marker = L.marker(suggestion.latlng, {
      opacity: .4
    });
    marker.addTo(map);
    markers.push(marker);
    return marker;
  }

  function removeMarker(marker) {
    map.removeLayer(marker);
  }

  function findBestZoom() {
    var featureGroup = L.featureGroup(markers);
    map.fitBounds(featureGroup.getBounds().pad(0.5), {
      animate: true
    });
  }
})();



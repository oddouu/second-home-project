let staticLocation = $('#static-location');

let lat = staticLocation[0].attributes.lat.value;
let lng = staticLocation[0].attributes.lng.value;

var mymap = L.map('map-example-container').setView([lat, lng], 12);

L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', {
  attribution: 'Map data © <a href="https://openstreetmap.org">OpenStreetMap</a> contributors',
  maxZoom: 18,
  id: 'mapbox/streets-v11',
  tileSize: 512,
  zoomOffset: -1,
}).addTo(mymap);


var circle = L.circle([lat, lng], {
  color: '#006a4e',
  fillColor: '#b8d5cd',
  fillOpacity: 0.5,
  radius: 500
}).addTo(mymap);
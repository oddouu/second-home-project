let arrayOfHiddenSpans = $('.d-none');
let lat;
let lng;
let id;
let loc;

var mymap = L.map('map-container').setView([42, 12], 2);

L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', {
  attribution: 'Map data © <a href="https://openstreetmap.org">OpenStreetMap</a> contributors',
  maxZoom: 15,
  id: 'mapbox/streets-v11',
  tileSize: 512,
  zoomOffset: -1,
}).addTo(mymap);

// let lat = staticLocation[0].attributes.lat.value;
// let lng = staticLocation[0].attributes.lng.value;

for (let i = 0; i < arrayOfHiddenSpans.length; i++) {

  if (arrayOfHiddenSpans[i].attributes.lat && arrayOfHiddenSpans[i].attributes.lng) {
    lat = arrayOfHiddenSpans[i].attributes.lat.value;
    lng = arrayOfHiddenSpans[i].attributes.lng.value;
    id = arrayOfHiddenSpans[i].attributes.listId.value;
    loc = arrayOfHiddenSpans[i].attributes.loc.value;

    var marker = L.marker([lat, lng], {
      // color: '#8abaae',
      // fillColor: '#b8d5cd',
      // fillOpacity: 0.5,
      // radius: 500
    }).addTo(mymap)
      .bindPopup(`<p>${loc}</p><a href="/listings/${id}">go to the listing</a>`);
    
  }
}




const el = document.createElement('div');
el.className = 'marker';

mapboxgl.accessToken = mapToken;
const map = new mapboxgl.Map({
    container: 'map', // container ID
    center: listing.geometry.coordinates, // starting position [lng, lat]
    style: 'mapbox://styles/mapbox/streets-v9', 
    zoom: 12 // starting zoom
});

// Create a new marker.
const marker = new mapboxgl.Marker(el)
    .setLngLat(listing.geometry.coordinates) // listing.geometry.coordinates
    .setPopup(new mapboxgl.Popup({ offset: 25 }).setHTML(
        `<h4>${listing.title}</h4><p>Exact location will be provided after booking</p>`
    ))
    .addTo(map);

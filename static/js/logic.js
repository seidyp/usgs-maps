// We create the tile layers that will be the selectable backgrounds of our map.

var tileLayerUrlTemplate = "https://api.mapbox.com/styles/v1/mapbox/{id}/tiles/{z}/{x}/{y}?access_token={accessToken}"
var grayLayerOptions = {
  attribution: "Map data &copy; <a href=\"https://www.openstreetmap.org/\">OpenStreetMap</a> contributors, <a href=\"https://creativecommons.org/licenses/by-sa/2.0/\">CC-BY-SA</a>, Imagery © <a href=\"https://www.mapbox.com/\">Mapbox</a>",
  tileSize: 512,
  maxZoom: 18,
  zoomOffset: -1,
  id: "mapbox/light-v10",
  accessToken: API_KEY}
// Create a L.tilelayer() using the 'mapbox/light-v10' map id
var grayMap = L.tileLayer(tileLayerUrlTemplate, grayLayerOptions);

var satelliteLayerOptions = {
  attribution: "Map data &copy; <a href=\"https://www.openstreetmap.org/\">OpenStreetMap</a> contributors, <a href=\"https://creativecommons.org/licenses/by-sa/2.0/\">CC-BY-SA</a>, Imagery © <a href=\"https://www.mapbox.com/\">Mapbox</a>",
  tileSize: 512,
  maxZoom: 18,
  zoomOffset: -1,
  id: "mapbox/satellite-v9",
  accessToken: API_KEY}
// Create a L.tilelayer() using the 'mapbox/satellite-v9' map id
var satelliteMap = L.tileLayer(tileLayerUrlTemplate, satelliteLayerOptions);

var outdooreLayerOptions = {
  attribution: "Map data &copy; <a href=\"https://www.openstreetmap.org/\">OpenStreetMap</a> contributors, <a href=\"https://creativecommons.org/licenses/by-sa/2.0/\">CC-BY-SA</a>, Imagery © <a href=\"https://www.mapbox.com/\">Mapbox</a>",
  tileSize: 512,
  maxZoom: 18,
  zoomOffset: -1,
  id: "mapbox/outdoors-v11",
  accessToken: API_KEY}
// Create a L.tilelayer() using the 'mapbox/outdoors-v11' map id
var outdoorsMap = L.tileLayer(tileLayerUrlTemplate, outdooreLayerOptions);


// We then create the map object with options. Adding the tile layers we just
// created to an array of layers.

// Create a L.map(), reference the 'mapid' element in the HTML page, and pass in the three layers above
var myMap = L.map("mapid", {
                            center: [40.7, -94.5],
                            zoom: 3,
                            layers: [grayMap, satelliteMap, outdoorsMap]
});

grayMap.addTo(myMap);


// We create the layers for our two different sets of data, earthquakes and
// tectonicplates.
var tectonicPlates = new L.LayerGroup();
var earthquakes = new L.LayerGroup();

// Defining an object that contains all of our different map choices. Only one
// of these maps will be visible at a time!
// Create a basemaps object for the three tileLayers from above. 
// The key should be a human readable name for the tile layer, and the value should be a tileLayer variable
var baseMaps = {Grayscale: grayMap, Satellite: satelliteMap, Terrain: outdoorsMap};

// We define an object that contains all of our overlays. Any combination of
// these overlays may be visible at the same time!

// Create a overlays object for the two LayerGroups from above. 
// The key should be a human readable name for the layer group, and the value should be a LayerGroup variable
var overlayMaps = {"Tectonic Plates": tectonicPlates, "Earthquakes": earthquakes};

// Add a L.control.layers() object and pass in the baseMaps and overlayMaps, and then .addTo myMap
L.control.layers(baseMaps, overlayMaps).addTo(myMap);

// function styleDetails(feature) {
//   return {
//     opacity: 1,
//     fillOpacity: 1,
//     fillColor: earthquakeColor(feature.geometry.coordinates[2]),
//     color: "#000000",
//     radius: earthquakeRadius(feature.properties.mag),
//     stroke: true,
//     weight: 0.5
//   };
// }

// defining function to determine earthquake color in following function
function earthquakeColor(depth) {
  switch (true) {
    case depth > 90:
      return "red";
    case depth > 70:
      return "orange";
    case depth > 50:
      return "yellow";
    case depth > 30:
      return "light green"
    default:
      return "light blue"
  }
};

function earthquakeRadius(magnitude) {
  if (magnitude == 0) {
    return 1;
  }
  else {
    return magnitude * 3;
  }
};

// Use d3.json() to call the API endpoint for earthquake geoJSON data, 
// .then() fire off an anonymous function that takes a single argument `data`.
d3.json("https://earthquake.usgs.gov/earthquakes/feed/v1.0/summary/all_week.geojson").then(function(data) {
  console.log(data); 
  var properties = data.features.properties;
  // var geometry = data.features.geometry;
  var depth = data.features.geometry[1];
  console.log(depth);
  var magnitude = properties.mag;
  var place = properties.place;
  console.log(features);
  
// Use L.geoJson() to parse the data, and do the following:
  L.geoJson(data, {
    // use pointToLayer to convert each feature to an L.circleMarker, see https://geospatialresponse.wordpress.com/2015/07/26/leaflet-geojson-pointtolayer/ for a tutorial
    pointToLayer: function(features, latlng) {
      return L.circleMarker(latlng)},
    // use style to set the color, radius, and other options for each circleMarker dynamically using the magnitude data
    style: {opacity: 1,
      fillOpacity: 1,
      fillColor: earthquakeColor(depth),
      color: "#000000",
      radius: earthquakeRadius(magnitude),
      stroke: true,
      weight: 0.5},
    // use onEachFeature to bind a popup with the magnitude and location of the earthquake to the layer (see above tutorial for an example)
    onEachFeature: function(features, layer) {
      layer.bindPopup(
        `Magnitude: ${magnitude} <br> Depth: ${depth} <br> Location: ${place}`
      );
    }

  }).addTo(earthquakes);  // use .addTo to add the L.geoJson object to the earthquakes LayerGroup

  // Then we add the earthquake layer to our map.
  earthquakes.addTo(myMap); // use .addTo to add the earthquakes LayerGroup to the myMap object

  // Create a dynamic legend that describes the color scheme for the circles
  // see this tutorial for guidance: https://www.igismap.com/legend-in-leafletjs-map-with-topojson/
  var legend = L.control({position: "bottomright"});

  legend.onAdd = function() {
    var div = L.DomUtil.create('div', 'info legend');

    var grades = [-100, 30, 50, 70, 90];

    var colors = ["light blue", "light green", "yellow", "orange", "red"];

    for (var i = 0; i < grades.length; i++) {
      div.innerHTML += "<i style='background: " + colors[i] + "'></i>" + grades[i] + (grades[i + 1] ? "&ndash;" + grades[i + 1] + "<br>" : "+");
    }

    return div;
  };

  legend.addTo(myMap);
});

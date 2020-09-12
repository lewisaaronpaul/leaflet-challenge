// code for creating Basic Map (Level 1)
//API endpoint for visualizing the GeoJSON data with leaflet
var queryUrl = "https://earthquake.usgs.gov/earthquakes/feed/v1.0/summary/1.0_month.geojson";

function markerSize(magnitude) {
    return magnitude * 3.5;
};

var earthquakes = new L.LayerGroup();

// GeoJSON data, with geoJSON and pointToLayer option
d3.json(queryUrl, function (geoJson) {
    L.geoJSON(geoJson.features, {
        pointToLayer: function (feature, latlng) {
            // Circle size is based on magnitude of earthquake.
            return L.circleMarker(latlng, { radius: markerSize(feature.properties.mag) });
        },
        // Circle fill color is based on significance of earthquake.
        style: function (geoJsonFeature) {
            return {
                fillColor: Color(geoJsonFeature.properties.sig),
                fillOpacity: 0.8,
                weight: 0.5,
                color: "black"
            }
        },

        onEachFeature(feature, layer) {
            layer.bindPopup("<h3>Earthquake: " + feature.properties.place + "</h3><hr><p>Time: " + new Date(feature.properties.time) + "</p><hr><p>Magnitude: " + feature.properties.mag + "</p><hr><p>Significance: " + feature.properties.sig + "</p>");
        }
    }).addTo(earthquakes);

    createMap(earthquakes);
});

// Function to create the circle colors based on their magnitude 1 - 5+
function Color(magnitude) {
    if (magnitude > 700) {
        return '#C62828'
    } else if (magnitude > 600) {
        return '#8E24AA'
    } else if (magnitude > 500) {
        return '#29B6F6'
    } else if (magnitude > 400) {
        return '#00FF33'
    } else if (magnitude > 300) {
        return '#FFEE58'
    } else if (magnitude > 200) {
        return '#DC7633'
    } else {
        return '#ffffff'
    }
};

function createMap(earthquakes) {
    // Define variables for our tile layers
    const streetmap = L.tileLayer("https://api.mapbox.com/styles/v1/{id}/tiles/{z}/{x}/{y}?access_token={accessToken}", {
        attribution: "© <a href='https://www.mapbox.com/about/maps/'>Mapbox</a> © <a href='http://www.openstreetmap.org/copyright'>OpenStreetMap</a> <strong><a href='https://www.mapbox.com/map-feedback/' target='_blank'>Improve this map</a></strong>",
        tileSize: 512,
        maxZoom: 18,
        zoomOffset: -1,
        id: "mapbox/streets-v11",
        accessToken: API_KEY
    });

    const light = L.tileLayer("https://api.mapbox.com/styles/v1/mapbox/{id}/tiles/{z}/{x}/{y}?access_token={accessToken}", {
        attribution: "Map data &copy; <a href=\"https://www.openstreetmap.org/\">OpenStreetMap</a> contributors, <a href=\"https://creativecommons.org/licenses/by-sa/2.0/\">CC-BY-SA</a>, Imagery © <a href=\"https://www.mapbox.com/\">Mapbox</a>",
        maxZoom: 18,
        id: "light-v10",
        accessToken: API_KEY
    });

    const dark = L.tileLayer("https://api.mapbox.com/styles/v1/mapbox/{id}/tiles/{z}/{x}/{y}?access_token={accessToken}", {
        attribution: "Map data &copy; <a href=\"https://www.openstreetmap.org/\">OpenStreetMap</a> contributors, <a href=\"https://creativecommons.org/licenses/by-sa/2.0/\">CC-BY-SA</a>, Imagery © <a href=\"https://www.mapbox.com/\">Mapbox</a>",
        maxZoom: 18,
        id: "dark-v10",
        accessToken: API_KEY
    });

    // Only one base layer can be shown at a time
    const baseMaps = {
        "Street Map": streetmap,
        Light: light,
        Dark: dark
    };

    // Overlays that may be toggled on or off
    const overlayMaps = {
        Earthquakes: earthquakes
    };

    // Create map object and set default layers
    const myMap = L.map("map", {
        center: [16.97, -7.99],
        zoom: 1.5,
        layers: [streetmap, earthquakes]
    });

    // Pass our map layers into our layer control
    // Add the layer control to the map 
    L.control.layers(baseMaps, overlayMaps, {
        collapsed: false
    }).addTo(myMap);


    // Function that provides the colors for the legend'
    function getColor(d) {
        return d > 700 ? '#C62828' :
            d > 600 ? '#8E24AA' :
                d > 500 ? '#29B6F6' :
                    d > 400 ? '#00FF33' :
                        d > 300 ? '#FFEE58' :
                            d > 200 ? '#DC7633' :
                                '#ffffff';
    }

    var legend = L.control({ position: "bottomright" });

    legend.onAdd = function (map) {

        var div = L.DomUtil.create('div', 'info legend');
        magnitude = [0, 200, 300, 400, 500, 600, 700];
        labels = [];

        div.innerHTML = '<div><b>EQ Significance</b></div';

        for (var i = 0; i < magnitude.length; i++) {
            div.innerHTML +=
                '<i style="background:' + getColor(magnitude[i] + 1) + '"></i> ' +
                magnitude[i] + (magnitude[i + 1] ? '&ndash;' + magnitude[i + 1] + '<br>' : '+');
        }
        return div;
    };

    legend.addTo(myMap);
}

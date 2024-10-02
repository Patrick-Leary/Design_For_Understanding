let mapSize;

document.addEventListener('DOMContentLoaded', function() {
    document.getElementById('size-tab').addEventListener('shown.bs.tab', function (e) {
        if (!mapSize) {
            initializeMapSize();
        } else {
            mapSize.invalidateSize();
        }
    });
});

function initializeMapSize() {
    mapSize = L.map('map-size').setView([37.8, -96], 4);
    L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', {
        attribution: '&copy; OpenStreetMap contributors'
    }).addTo(mapSize);

    let geojsonLayerSize;
    let colorScaleSize;

    // Load and process the CSV data
    d3.csv("data/processed_wildfire_data_yearly.csv").then(function(csvData) {
        const dataByYear = d3.group(csvData, d => d.Year);
        const years = Array.from(dataByYear.keys()).sort();

        const maxFireSize = d3.max(csvData, d => +d.Total_Fire_Size);
        colorScaleSize = d3.scaleSequential(d3.interpolateOranges)
            .domain([1, Math.log(maxFireSize)]);

        // Load GeoJSON data
        d3.json("https://raw.githubusercontent.com/python-visualization/folium/master/examples/data/us-states.json").then(function(statesData) {
            geojsonLayerSize = L.geoJson(statesData, {
                style: function(feature) {
                    return {
                        fillColor: colorScaleSize(0),
                        weight: 1,
                        opacity: 1,
                        color: 'white',
                        fillOpacity: 0.7
                    };
                },
                onEachFeature: function(feature, layer) {
                    layer.bindPopup(feature.properties.name);
                }
            }).addTo(mapSize);

            // Initialize the map with the first year
            updateMapSize(years[0]);

            // Set up the time slider
            const slider = document.getElementById('timeSliderSize');
            slider.max = years.length - 1;
            slider.oninput = function() {
                updateMapSize(years[this.value]);
            };

            // Add the corrected legend
            const legend = L.control({position: 'bottomright'});
            legend.onAdd = function (map) {
                const div = L.DomUtil.create('div', 'info legend');
                const grades = [0, 10, 100, 1000, 10000, 100000, 1000000, 10000000];
                const labels = [];

                for (let i = 0; i < grades.length - 1; i++) {
                    const from = grades[i];
                    const to = grades[i + 1];

                    labels.push(
                        '<i style="background:' + colorScaleSize(from > 0 ? Math.log(from) : 0) + '"></i> ' +
                        from + (to ? '&ndash;' + to : '+'));
                }

                div.innerHTML = labels.join('<br>');
                return div;
            };
            legend.addTo(mapSize);
        });

        function updateMapSize(year) {
            const data = dataByYear.get(year);
            const wildfireSizes = d3.rollup(data, v => d3.sum(v, d => +d.Total_Fire_Size), d => stateNameMapping[d.STATE] || d.STATE);
            
            geojsonLayerSize.eachLayer(function(layer) {
                const stateName = layer.feature.properties.name;
                const size = wildfireSizes.get(stateName) || 0;
                layer.setStyle({
                    fillColor: colorScaleSize(size > 0 ? Math.log(size) : 0),
                    weight: 1,
                    opacity: 1,
                    color: 'white',
                    fillOpacity: 0.7
                });
                layer.bindPopup(`${stateName}: ${size.toFixed(2)} acres burned`);
            });

            document.getElementById('currentDateSize').textContent = year;
        }
    });
}


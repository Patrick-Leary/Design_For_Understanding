let mapSize;
let geojsonLayerSize;
let colorScaleSize;
let dataByYear;

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
    // Move stateNameMappingSize inside this function
    const stateNameMappingSize = {
        'Alabama': 'AL', 'Alaska': 'AK', 'Arizona': 'AZ', 'Arkansas': 'AR', 'California': 'CA',
        'Colorado': 'CO', 'Connecticut': 'CT', 'Delaware': 'DE', 'Florida': 'FL', 'Georgia': 'GA',
        'Hawaii': 'HI', 'Idaho': 'ID', 'Illinois': 'IL', 'Indiana': 'IN', 'Iowa': 'IA',
        'Kansas': 'KS', 'Kentucky': 'KY', 'Louisiana': 'LA', 'Maine': 'ME', 'Maryland': 'MD',
        'Massachusetts': 'MA', 'Michigan': 'MI', 'Minnesota': 'MN', 'Mississippi': 'MS', 'Missouri': 'MO',
        'Montana': 'MT', 'Nebraska': 'NE', 'Nevada': 'NV', 'New Hampshire': 'NH', 'New Jersey': 'NJ',
        'New Mexico': 'NM', 'New York': 'NY', 'North Carolina': 'NC', 'North Dakota': 'ND', 'Ohio': 'OH',
        'Oklahoma': 'OK', 'Oregon': 'OR', 'Pennsylvania': 'PA', 'Rhode Island': 'RI', 'South Carolina': 'SC',
        'South Dakota': 'SD', 'Tennessee': 'TN', 'Texas': 'TX', 'Utah': 'UT', 'Vermont': 'VT',
        'Virginia': 'VA', 'Washington': 'WA', 'West Virginia': 'WV', 'Wisconsin': 'WI', 'Wyoming': 'WY'
    };

    mapSize = L.map('map-size').setView([37.8, -110], 3);
    L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', {
        attribution: '&copy; OpenStreetMap contributors'
    }).addTo(mapSize);

    // Load and process the CSV data
    d3.csv("data/processed_wildfire_data_yearly.csv").then(function(csvData) {
        dataByYear = d3.group(csvData, d => d.Year);
        const years = Array.from(dataByYear.keys()).sort();

        const maxFireSize = d3.max(csvData, d => +d.Total_Fire_Size);
        colorScaleSize = d3.scaleSequential(d3.interpolateOranges)
            .domain([0, Math.log(maxFireSize)]);

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
                    layer.on({
                        click: function(e) {
                            let stateName = e.target.feature.properties.name;
                            updateLineChartSize(stateName);
                        }
                    });
                }
            }).addTo(mapSize);

            mapSize.on('click', function(e) {
                if (!e.originalEvent.target.classList.contains('leaflet-interactive')) {
                    updateLineChartSize(); // full reset (all states)
                }
            });

            // Initialize the map with the first year
            updateMapSize(years[0]);

            // Set up the time slider
            const slider = document.getElementById('timeSliderSize');
            slider.max = years.length - 1;
            slider.oninput = function() {
                updateMapSize(years[this.value]);
            };

            // Add a legend
            const legend = L.control({position: 'bottomright'});
            legend.onAdd = function (map) {
                const div = L.DomUtil.create('div', 'info legend');
                const grades = [0, 100, 1000, 10000, 100000, 1000000];
                const labels = [];

                for (let i = 0; i < grades.length; i++) {
                    const from = grades[i];
                    const to = grades[i + 1];

                    labels.push(
                        '<i style="background:' + colorScaleSize(Math.log(from + 1)) + '"></i> ' +
                        from + (to ? '&ndash;' + to : '+') + ' acres');
                }

                div.innerHTML = labels.join('<br>');
                return div;
            };
            legend.addTo(mapSize);
        });
    });

    function updateMapSize(year) {
        if (!dataByYear) return; // Make sure data is loaded

        const data = dataByYear.get(year);
        const wildfireSizes = d3.rollup(data, v => d3.sum(v, d => +d.Total_Fire_Size), d => d.STATE);
        
        geojsonLayerSize.eachLayer(function(layer) {
            const stateName = layer.feature.properties.name;
            const stateAbbrev = stateNameMappingSize[stateName];
            const size = wildfireSizes.get(stateAbbrev) || 0;
            layer.setStyle({
                fillColor: colorScaleSize(Math.log(size + 1)),
                weight: 1,
                opacity: 1,
                color: 'white',
                fillOpacity: 0.7
            });
            layer.bindPopup(`${stateName}: ${size.toFixed(2)} acres burned`);
        });

        document.getElementById('currentDateSize').textContent = year;
    }
}
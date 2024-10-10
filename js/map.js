// Create the map
const map = L.map('map').setView([37.8, -110], 3);

// Add the tile layer
L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', {
    attribution: '&copy; OpenStreetMap contributors'
}).addTo(map);

// State abbreviation to full name mapping
const stateNameMapping = {
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

let geojsonLayer;
let colorScale;

// Load and process the CSV data
d3.csv("data/processed_wildfire_data_yearly.csv").then(function(csvData) {
    const dataByYear = d3.group(csvData, d => d.Year);
    const years = Array.from(dataByYear.keys()).sort();

    const maxFires = d3.max(csvData, d => +d.Total_Fires);
    colorScale = d3.scaleSequential(d3.interpolateReds)
        .domain([0, maxFires]);

    // Load GeoJSON data
    d3.json("https://raw.githubusercontent.com/python-visualization/folium/master/examples/data/us-states.json").then(function(statesData) {
        geojsonLayer = L.geoJson(statesData, {
            style: function(feature) {
                return {
                    fillColor: colorScale(0),
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
                        updateLineChart(stateName);
                    }
                    
                });
                map.on('click', function(e) {
                    if (!e.originalEvent.target.classList.contains('leaflet-interactive')) {
                        updateLineChart(); // full reset (all states)
                    }
                });                
            }
        }).addTo(map);

        // Initialize the map with the first year
        updateMap(years[0]);

        // Set up the time slider
        const slider = document.getElementById('timeSlider');
        slider.max = years.length - 1;
        slider.oninput = function() {
            updateMap(years[this.value]);
        };

        // Add a legend
        const legend = L.control({position: 'bottomright'});
        legend.onAdd = function (map) {
            const div = L.DomUtil.create('div', 'info legend');
            const grades = [0, 100, 250, 500, 1000, 2000];
            const labels = [];

            for (let i = 0; i < grades.length; i++) {
                const from = grades[i];
                const to = grades[i + 1];

                labels.push(
                    '<i style="background:' + colorScale(from + 1) + '"></i> ' +
                    from + (to ? '&ndash;' + to : '+'));
            }

            div.innerHTML = labels.join('<br>');
            return div;
        };
        legend.addTo(map);
    });

    function updateMap(year) {
        const data = dataByYear.get(year);
        const wildfireCounts = d3.rollup(data, v => d3.sum(v, d => +d.Total_Fires), d => d.STATE);
        
        geojsonLayer.eachLayer(function(layer) {
            const stateName = layer.feature.properties.name;
            const stateAbbrev = stateNameMapping[stateName];
            const count = wildfireCounts.get(stateAbbrev) || 0;
            layer.setStyle({
                fillColor: colorScale(count),
                weight: 1,
                opacity: 1,
                color: 'white',
                fillOpacity: 0.7
            });
            layer.bindPopup(`${stateName}: ${count} wildfires`);
        });
    
        document.getElementById('currentDate').textContent = year;
    }
});
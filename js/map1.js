// Create the map
const map = L.map('map1').setView([37.8, -96], 4);

// Add the tile layer
L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', {
    attribution: '&copy; OpenStreetMap contributors'
}).addTo(map);

// State abbreviation to full name mapping
const stateNameMapping = {
    'AL': 'Alabama', 'AK': 'Alaska', 'AZ': 'Arizona', 'AR': 'Arkansas', 'CA': 'California',
    'CO': 'Colorado', 'CT': 'Connecticut', 'DE': 'Delaware', 'FL': 'Florida', 'GA': 'Georgia',
    'HI': 'Hawaii', 'ID': 'Idaho', 'IL': 'Illinois', 'IN': 'Indiana', 'IA': 'Iowa',
    'KS': 'Kansas', 'KY': 'Kentucky', 'LA': 'Louisiana', 'ME': 'Maine', 'MD': 'Maryland',
    'MA': 'Massachusetts', 'MI': 'Michigan', 'MN': 'Minnesota', 'MS': 'Mississippi', 'MO': 'Missouri',
    'MT': 'Montana', 'NE': 'Nebraska', 'NV': 'Nevada', 'NH': 'New Hampshire', 'NJ': 'New Jersey',
    'NM': 'New Mexico', 'NY': 'New York', 'NC': 'North Carolina', 'ND': 'North Dakota', 'OH': 'Ohio',
    'OK': 'Oklahoma', 'OR': 'Oregon', 'PA': 'Pennsylvania', 'RI': 'Rhode Island', 'SC': 'South Carolina',
    'SD': 'South Dakota', 'TN': 'Tennessee', 'TX': 'Texas', 'UT': 'Utah', 'VT': 'Vermont',
    'VA': 'Virginia', 'WA': 'Washington', 'WV': 'West Virginia', 'WI': 'Wisconsin', 'WY': 'Wyoming'
};

let geojsonLayer;
let colorScale;

// Load and process the CSV data
d3.csv("data/processed_wildfire_data_yearly.csv").then(function(csvData) {
    // Filter data for the year 3
    const data1993 = csvData.filter(d => d.Year === "1993");

    // Get the maximum number of fires for 1993 to set the color scale
    const maxFires1993 = d3.max(csvData, d => +d.Total_Fires);
    // this is using the csvData for the relative colorscale
    colorScale = d3.scaleSequential(d3.interpolateReds)
        .domain([0, maxFires1993]);

    // Load GeoJSON data
    d3.json("https://raw.githubusercontent.com/python-visualization/folium/master/examples/data/us-states.json").then(function(statesData) {
        geojsonLayer = L.geoJson(statesData, {
            style: function(feature) {
                return {
                    fillColor: colorScale(0),  // Default fill color before data is applied
                    weight: 1,
                    opacity: 1,
                    color: 'white',
                    fillOpacity: 0.7
                };
            },
            onEachFeature: function(feature, layer) {
                layer.bindPopup(feature.properties.name);  // Default popup with state name
            }
        }).addTo(map);

        // Update the map with the 1993 data
        updateMapFor1993(data1993);

        // Add the legend for color ranges
        addLegend();
    });

    function updateMapFor1993(data1993) {
        // Sum wildfire counts by state for 1993
        const wildfireCounts1993 = d3.rollup(data1993, v => d3.sum(v, d => +d.Total_Fires), d => stateNameMapping[d.STATE] || d.STATE);

        geojsonLayer.eachLayer(function(layer) {
            const stateName = layer.feature.properties.name;
            const count = wildfireCounts1993.get(stateName) || 0;
            layer.setStyle({
                fillColor: colorScale(count),
                weight: 1,
                opacity: 1,
                color: 'white',
                fillOpacity: 0.7
            });
            layer.bindPopup(`${stateName}: ${count} wildfires`);
        });
    }

    // Function to add a legend to the map
    function addLegend() {
        const legend = L.control({ position: 'bottomright' });

        legend.onAdd = function (map) {
            const div = L.DomUtil.create('div', 'info legend');
            const grades = [0, 100, 250, 500, 1000, 2000];
            const labels = [];

            // Loop through density intervals and generate a label with a colored square for each interval
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
    }
});
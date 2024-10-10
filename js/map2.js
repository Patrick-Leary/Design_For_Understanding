// Create the map
const map2 = L.map('map2').setView([37.8, -110], 3);

// Add the tile layer
L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', {
    attribution: '&copy; OpenStreetMap contributors'
}).addTo(map2);

// State abbreviation to full name mapping
const stateNameMapping1 = {
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

let geojsonLayer1;
let colorScale1;

// Load and process the CSV data
d3.csv("data/processed_wildfire_data_yearly.csv").then(function(csvData) {
    // Filter data for the year 3
    const data2011 = csvData.filter(d => d.Year === "2011");

    // Get the maximum number of fires for 2011 to set the color scale
    const maxFires2011 = d3.max(csvData, d => +d.Total_Fires);
    // this is using the csvData for the relative colorscale
    colorScale1 = d3.scaleSequential(d3.interpolateReds)
        .domain([0, maxFires2011]);

    // Load GeoJSON data
    d3.json("https://raw.githubusercontent.com/python-visualization/folium/master/examples/data/us-states.json").then(function(statesData) {
        geojsonLayer1 = L.geoJson(statesData, {
            style: function(feature) {
                return {
                    fillColor: colorScale1(0),  // Default fill color before data is applied
                    weight: 1,
                    opacity: 1,
                    color: 'white',
                    fillOpacity: 0.7
                };
            },
            onEachFeature: function(feature, layer) {
                layer.bindPopup(feature.properties.name);  // Default popup with state name
            }
        }).addTo(map2);

        // Update the map with the 2011 data
        updateMapFor2011(data2011);

        // Add the legend for color ranges
        addLegend();
    });

    function updateMapFor2011(data2011) {
        // Sum wildfire counts by state for 2011
        const wildfireCounts2011 = d3.rollup(data2011, v => d3.sum(v, d => +d.Total_Fires), d => stateNameMapping1[d.STATE] || d.STATE);

        geojsonLayer1.eachLayer(function(layer) {
            const stateName = layer.feature.properties.name;
            const count = wildfireCounts2011.get(stateName) || 0;
            layer.setStyle({
                fillColor: colorScale1(count),
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
                    '<i style="background:' + colorScale1(from + 1) + '"></i> ' +
                    from + (to ? '&ndash;' + to : '+'));
            }

            div.innerHTML = labels.join('<br>');
            return div;
        };

        legend.addTo(map2);
    }
});
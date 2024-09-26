// Create the map
const map = L.map('map').setView([37.8, -96], 4);

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

// Load and process the CSV data
d3.csv("data/US_Lightning_Forest_Fires.csv").then(function(csvData) {
    // Count wildfires by state
    const wildfireCounts = d3.rollup(csvData, v => v.length, d => stateNameMapping[d.STATE] || d.STATE);
    console.log("Wildfire counts:", wildfireCounts);

    // Define color scale
    const colorScale = d3.scaleSequential(d3.interpolateReds)
        .domain([0, d3.max(wildfireCounts.values())]);

    // Load GeoJSON data
    d3.json("https://raw.githubusercontent.com/python-visualization/folium/master/examples/data/us-states.json").then(function(statesData) {
        L.geoJson(statesData, {
            style: function(feature) {
                const stateName = feature.properties.name;
                const count = wildfireCounts.get(stateName) || 0;
                console.log("Processing state:", stateName, "Count:", count); // Log each state being processed
                return {
                    fillColor: colorScale(count),
                    weight: 1,
                    opacity: 1,
                    color: 'white',
                    fillOpacity: 0.7
                };
            },
            onEachFeature: function(feature, layer) {
                const stateName = feature.properties.name;
                const count = wildfireCounts.get(stateName) || 0;
                layer.bindPopup(`${stateName}: ${count} wildfires`);
            }
        }).addTo(map);

        // Add a legend
        const legend = L.control({position: 'bottomright'});
        legend.onAdd = function (map) {
            const div = L.DomUtil.create('div', 'info legend');
            const grades = [0, 1000, 5000, 10000, 20000, 30000];
            const labels = [];
            let from, to;

            for (let i = 0; i < grades.length; i++) {
                from = grades[i];
                to = grades[i + 1];

                labels.push(
                    '<i style="background:' + colorScale(from + 1) + '"></i> ' +
                    from + (to ? '&ndash;' + to : '+'));
            }

            div.innerHTML = labels.join('<br>');
            return div;
        };
        legend.addTo(map);
    });
});
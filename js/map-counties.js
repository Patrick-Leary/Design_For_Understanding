// map-counties.js

// Initialize the map when the tab is shown
let mapCounties;

document.addEventListener('DOMContentLoaded', function() {
    document.getElementById('counties-tab').addEventListener('shown.bs.tab', function (e) {
        if (!mapCounties) {
            initializeMapCounties();
        } else {
            mapCounties.invalidateSize();
        }
    });
});

function initializeMapCounties() {
    // Create the map
    mapCounties = L.map('map-counties').setView([37.8, -96], 4);

    // Add the tile layer
    L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', {
        attribution: '&copy; OpenStreetMap contributors'
    }).addTo(mapCounties);

    // State abbreviation to FIPS code mapping
    const stateAbbrevToFIPS = {
        'AL': '01', 'AK': '02', 'AZ': '04', 'AR': '05', 'CA': '06',
        'CO': '08', 'CT': '09', 'DE': '10', 'FL': '12', 'GA': '13',
        'HI': '15', 'ID': '16', 'IL': '17', 'IN': '18', 'IA': '19',
        'KS': '20', 'KY': '21', 'LA': '22', 'ME': '23', 'MD': '24',
        'MA': '25', 'MI': '26', 'MN': '27', 'MS': '28', 'MO': '29',
        'MT': '30', 'NE': '31', 'NV': '32', 'NH': '33', 'NJ': '34',
        'NM': '35', 'NY': '36', 'NC': '37', 'ND': '38', 'OH': '39',
        'OK': '40', 'OR': '41', 'PA': '42', 'RI': '44', 'SC': '45',
        'SD': '46', 'TN': '47', 'TX': '48', 'UT': '49', 'VT': '50',
        'VA': '51', 'WA': '53', 'WV': '54', 'WI': '55', 'WY': '56',
        'DC': '11' // District of Columbia
    };

    // State FIPS to State Name mapping
    const stateFIPSMapping = {
        '01': 'Alabama', '02': 'Alaska', '04': 'Arizona', '05': 'Arkansas', '06': 'California',
        '08': 'Colorado', '09': 'Connecticut', '10': 'Delaware', '11': 'District of Columbia',
        '12': 'Florida', '13': 'Georgia', '15': 'Hawaii', '16': 'Idaho', '17': 'Illinois',
        '18': 'Indiana', '19': 'Iowa', '20': 'Kansas', '21': 'Kentucky', '22': 'Louisiana',
        '23': 'Maine', '24': 'Maryland', '25': 'Massachusetts', '26': 'Michigan', '27': 'Minnesota',
        '28': 'Mississippi', '29': 'Missouri', '30': 'Montana', '31': 'Nebraska', '32': 'Nevada',
        '33': 'New Hampshire', '34': 'New Jersey', '35': 'New Mexico', '36': 'New York',
        '37': 'North Carolina', '38': 'North Dakota', '39': 'Ohio', '40': 'Oklahoma', '41': 'Oregon',
        '42': 'Pennsylvania', '44': 'Rhode Island', '45': 'South Carolina', '46': 'South Dakota',
        '47': 'Tennessee', '48': 'Texas', '49': 'Utah', '50': 'Vermont', '51': 'Virginia',
        '53': 'Washington', '54': 'West Virginia', '55': 'Wisconsin', '56': 'Wyoming'
    };

    let geojsonLayerCounties; // To hold the GeoJSON layer
    let colorScaleCounties;   // To hold the color scale
    let dataByYear;           // To hold data grouped by year
    let years;                // Array of years

    let legend; // Declare legend here so it's accessible throughout the function

    Promise.all([
        fetch('data/counties.geojson').then(res => res.json()),
        d3.csv('data/US_Lightning_Forest_Fires_Cleaned.csv') // Use the cleaned data
    ]).then(([countiesData, wildfireData]) => {
        console.log('Wildfire Data Loaded:', wildfireData); // For debugging

        // Process wildfire data to add 'GEOID'
        const validWildfireData = [];

        wildfireData.forEach(d => {
            // Map state abbreviation to state FIPS code
            const stateFIPS = stateAbbrevToFIPS[d.STATE];
            if (!stateFIPS) {
                console.warn(`Invalid STATE abbreviation: ${d.STATE} at FIRE_ID: ${d.FIRE_ID}`);
                return; // Skip this entry
            }

            // Ensure FIPS_CODE is present
            let countyFIPS = d.FIPS_CODE;
            if (!countyFIPS || countyFIPS.trim() === '') {
                console.warn(`Missing FIPS_CODE at FIRE_ID: ${d.FIRE_ID}`);
                return; // Skip this entry
            }

            // Process FIPS_CODE
            if (typeof countyFIPS === 'number') {
                countyFIPS = countyFIPS.toString();
            }
            if (countyFIPS.includes('.')) {
                countyFIPS = countyFIPS.split('.')[0];
            }
            countyFIPS = countyFIPS.padStart(3, '0');

            // Construct GEOID
            d.GEOID = stateFIPS + countyFIPS;

            // Ensure Year is a number
            d.Year = +d.FIRE_YEAR;
            if (isNaN(d.Year)) {
                console.warn(`Invalid FIRE_YEAR: ${d.FIRE_YEAR} at FIRE_ID: ${d.FIRE_ID}`);
                return; // Skip this entry
            }

            // Add to valid data array
            validWildfireData.push(d);
        });

        // Group data by year
        dataByYear = d3.group(validWildfireData, d => d.Year);

        // Get array of years with data and sort
        years = Array.from(dataByYear.keys()).sort((a, b) => a - b);

        // Set up the slider
        const slider = document.getElementById('timeSliderCounties');
        slider.min = 0;
        slider.max = years.length - 1;
        slider.value = 0;

        // Set up color scale without domain
        colorScaleCounties = d3.scaleSequential(d3.interpolateOrRd).domain([0, 100]);

        // Load GeoJSON data and add to map
        geojsonLayerCounties = L.geoJson(countiesData, {
            style: function(feature) {
                return {
                    fillColor: '#FFFFFF',
                    weight: 0.5,
                    opacity: 1,
                    color: '#666666',
                    fillOpacity: 0.7
                };
            },
            onEachFeature: function(feature, layer) {
                const countyName = feature.properties.NAME;
                const stateFIPS = feature.properties.STATEFP;
                const stateName = stateFIPSMapping[stateFIPS];
                const countyGEOID = feature.properties.GEOID;

                layer.bindPopup(`${countyName}, ${stateName}`);

                layer.on('click', function() {
                    // Call the update function for the line chart
                    updateLineChartCounties(countyGEOID, `${countyName}, ${stateName}`);
                });
            }
        }).addTo(mapCounties);

        // Initialize the legend variable
        legend = L.control({position: 'bottomright'});

        legend.onAdd = function(map) {
            const div = L.DomUtil.create('div', 'info legend');
            const labels = [];
            const grades = [0, 1, 5, 10, 20, 50, 100];

            // Generate a label with a colored square for each interval
            for (let i = 0; i < grades.length; i++) {
                const from = grades[i];
                const to = grades[i + 1];
        
                labels.push(
                    '<i style="background:' + colorScaleCounties(from) + '"></i> ' +
                    from + (to ? '&ndash;' + to : '+'));
            }
        
            div.innerHTML = labels.join('<br>');
            return div;
        };

        legend.addTo(mapCounties);

        // Initialize the map with the first year
        updateMapCounties(years[0]);

        // Update the map when the slider value changes
        slider.oninput = function() {
            const selectedYearIndex = +this.value;
            const selectedYear = years[selectedYearIndex];
            updateMapCounties(selectedYear);
        };

        // Add the map click event listener here, after the map is initialized
        mapCounties.on('click', function(e) {
            if (!e.originalEvent.target.classList.contains('leaflet-interactive')) {
                updateLineChartCounties(); // Reset to placeholder message
            }
        });

    }).catch(error => console.error('Error loading data:', error));

    function updateMapCounties(year) {
        // Get data for the selected year
        const data = dataByYear.get(year) || [];

        // Aggregate wildfire data by GEOID for the selected year
        const wildfireByCounty = d3.rollup(
            data,
            v => v.length, // Counts the number of fires per county
            d => d.GEOID
        );

        // Update color scale domain based on the max fires in the selected year
        const maxFiresYear = d3.max(Array.from(wildfireByCounty.values())) || 0;
        colorScaleCounties.domain([0, Math.max(maxFiresYear, 100)]);

        // Update the legend
        const legend = document.querySelector('.legend');
        if (legend) {
            const grades = [0, 1, 5, 10, 20, 50, Math.min(100, maxFiresYear)];
            const labels = grades.map((grade, i) => {
                const from = grade;
                const to = grades[i + 1];
                return '<i style="background:' + colorScaleCounties(from) + '"></i> ' +
                    from + (to ? '&ndash;' + to : '+');
            });
            legend.innerHTML = labels.join('<br>');
        }

        // Update the legend
        if (legend) {
            legend.remove();
            legend.addTo(mapCounties);
        }

        // Update the map styles
        geojsonLayerCounties.eachLayer(function(layer) {
            const countyGEOID = layer.feature.properties.GEOID;
            const fireCount = wildfireByCounty.get(countyGEOID) || 0; // Assign zero if no data
            layer.setStyle({
                fillColor: colorScaleCounties(fireCount),
                weight: 0.5,
                color: '#666666',
                fillOpacity: 0.7
            });
            // Update the popup content
            const countyName = layer.feature.properties.NAME;
            const stateFIPS = layer.feature.properties.STATEFP;
            const stateName = stateFIPSMapping[stateFIPS];
            layer.bindPopup(`${countyName}, ${stateName}: ${fireCount} wildfires`);
        });

        // Update the current year display
        document.getElementById('currentDateCounties').textContent = year;
    }
}

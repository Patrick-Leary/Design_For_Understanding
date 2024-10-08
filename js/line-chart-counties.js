// Set up dimensions
const marginCounties = {top: 50, right: 30, bottom: 30, left: 60};
let widthCounties = 900 - marginCounties.left - marginCounties.right;
let heightCounties = 450 - marginCounties.top - marginCounties.bottom;

// Create SVG
const svgCounties = d3.select("#line-chart-counties")
    .append("svg")
    .attr("viewBox", `0 0 ${widthCounties + marginCounties.left + marginCounties.right} ${heightCounties + marginCounties.top + marginCounties.bottom}`)
    .append("g")
    .attr("transform", `translate(${marginCounties.left},${marginCounties.top})`);

// Scales
const xScaleCounties = d3.scaleLinear().range([0, widthCounties]);
const yScaleCounties = d3.scaleLinear().range([heightCounties, 0]);

// Global variable to hold the data
let countyDataAll;

// Load data
d3.csv('data/US_Lightning_Forest_Fires.csv').then(function(data) {
    // Process data
    data.forEach(d => {
        d.Year = +d.FIRE_YEAR;
        d.GEOID = constructGEOID(d);
    });
    countyDataAll = data;

    // Initialize with no data
    updateLineChartCounties();
});

function updateLineChartCounties(countyGEOID, countyName) {
    // Clear previous content
    svgCounties.selectAll("*").remove();

    if (!countyGEOID) {
        // No county selected, display a message
        svgCounties.append("text")
            .attr("x", widthCounties / 2)
            .attr("y", heightCounties / 2)
            .attr("text-anchor", "middle")
            .text("Click on a county to see the data over time.");
        return;
    }

    // Filter data for the selected county
    const countyData = countyDataAll.filter(d => d.GEOID === countyGEOID);

    // Group data by year and count fires
    const firesByYear = d3.rollup(countyData, v => v.length, d => d.Year);

    // Get the full range of years from the data
    const allYears = d3.range(d3.min(countyDataAll, d => d.Year), d3.max(countyDataAll, d => d.Year) + 1);

    // Create an array of objects with zeros for missing years
    const dataArray = allYears.map(year => {
        return {
            Year: year,
            Total_Fires: firesByYear.get(year) || 0
        };
    });

    // Set domains
    xScaleCounties.domain(d3.extent(dataArray, d => d.Year));
    yScaleCounties.domain([0, d3.max(dataArray, d => d.Total_Fires)]);

    // Line generator
    const lineCounties = d3.line()
        .x(d => xScaleCounties(d.Year))
        .y(d => yScaleCounties(d.Total_Fires));

    // Add the line path
    svgCounties.append("path")
        .datum(dataArray)
        .attr("fill", "none")
        .attr("stroke", "darkgreen")
        .attr("stroke-width", 2)
        .attr("d", lineCounties);

    // Add x-axis
    svgCounties.append("g")
        .attr("transform", `translate(0,${heightCounties})`)
        .call(d3.axisBottom(xScaleCounties).ticks(10).tickFormat(d3.format("d")));

    // Add y-axis
    svgCounties.append("g")
        .call(d3.axisLeft(yScaleCounties));

    // Add labels
    svgCounties.append("text")
        .attr("x", widthCounties / 2)
        .attr("y", heightCounties + marginCounties.bottom)
        .attr("text-anchor", "middle")
        .text("Year");

    svgCounties.append("text")
        .attr("transform", "rotate(-90)")
        .attr("y", 0 - marginCounties.left)
        .attr("x", 0 - (heightCounties / 2))
        .attr("dy", "1em")
        .attr("text-anchor", "middle")
        .text("Total Fires");

    // Add title
    svgCounties.append("text")
        .attr("x", widthCounties / 2)
        .attr("y", 0 - marginCounties.top / 2)
        .attr("text-anchor", "middle")
        .style("font-size", "16px")
        .text(`Total Fires in ${countyName} by Year`);
}

// Function to construct GEOID for a data row
function constructGEOID(d) {
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

    const stateFIPS = stateAbbrevToFIPS[d.STATE];

    // Ensure FIPS_CODE is a string and pad to 3 digits
    let countyFIPS = d.FIPS_CODE;
    if (typeof countyFIPS === 'number') {
        countyFIPS = countyFIPS.toString();
    }
    if (countyFIPS.includes('.')) {
        countyFIPS = countyFIPS.split('.')[0];
    }
    countyFIPS = countyFIPS.padStart(3, '0');

    // Construct GEOID
    return stateFIPS + countyFIPS;
}

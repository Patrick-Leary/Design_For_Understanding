// Set up dimensions
const margin = {top: 50, right: 30, bottom: 30, left: 60};
let width = 900 - margin.left - margin.right;
let height = 450 - margin.top - margin.bottom;

// Create SVG
const svg = d3.select("#line-chart")
    .append("svg")
    .attr("viewBox", `0 0 ${width + margin.left + margin.right} ${height + margin.top + margin.bottom}`)
    .append("g")
    .attr("transform", `translate(${margin.left},${margin.top})`);

// Scales
const x = d3.scaleLinear().range([0, width]);
const y = d3.scaleLinear().range([height, 0]);

// State abbreviation to full name mapping
const stateAbbrevMapping = {
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

let allData;

d3.csv("data/processed_wildfire_data.csv").then(function(data) {
    allData = data;
    updateLineChart();
});

function updateLineChart(stateName) {
  
    svg.selectAll("*").remove(); // clear prev info 
    
    let data;
    if (stateName) {
        const stateAbbrev = stateAbbrevMapping[stateName];
        data = allData.filter(d => d.STATE === stateAbbrev);
    } else {
        data = allData;
    }
    
    const yearlyData = d3.rollup(data, 
        v => d3.sum(v, d => +d.Total_Fires), 
        d => d.Year
    );

    // Convert to array of objects
    const firesByYear = Array.from(yearlyData, ([year, fires]) => ({Year: +year, Total_Fires: fires}));

    // Sort by year
    firesByYear.sort((a, b) => a.Year - b.Year);

    // Update scales
    x.domain(d3.extent(firesByYear, d => d.Year));
    y.domain([0, d3.max(firesByYear, d => d.Total_Fires)]);

    // Create line
    const line = d3.line()
        .x(d => x(d.Year))
        .y(d => y(d.Total_Fires));

    // Add line to chart
    svg.append("path")
        .datum(firesByYear)
        .attr("fill", "none")
        .attr("stroke", "darkred")
        .attr("stroke-width", 2)
        .attr("d", line);

    // Add x-axis
    svg.append("g")
        .attr("transform", `translate(0,${height})`)
        .call(d3.axisBottom(x).ticks(10).tickFormat(d3.format("d")));

    // Add y-axis
    svg.append("g")
        .call(d3.axisLeft(y));

    // Add labels
    svg.append("text")
        .attr("x", width / 2)
        .attr("y", height + margin.bottom)
        .attr("text-anchor", "middle")
        .text("Year");

    svg.append("text")
        .attr("transform", "rotate(-90)")
        .attr("y", 0 - margin.left)
        .attr("x", 0 - (height / 2))
        .attr("dy", "1em")
        .attr("text-anchor", "middle")
        .text("Total Fires");

    // Add title
    svg.append("text")
        .attr("x", width / 2)
        .attr("y", 0 - margin.top / 2)
        .attr("text-anchor", "middle")
        .style("font-size", "16px")
        .text(stateName ? `Total Fires in ${stateName} by Year` : "Total Fires by Year");
}

window.updateLineChart = updateLineChart;

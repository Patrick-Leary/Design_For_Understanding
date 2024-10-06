// Set up dimensions
const marginSize = {top: 50, right: 30, bottom: 40, left: 90};
let widthSize = 900 - marginSize.left - marginSize.right;
let heightSize = 450 - marginSize.top - marginSize.bottom;

// Create SVG
const svgSize = d3.select("#line-chart-size")
    .append("svg")
    .attr("viewBox", `0 0 ${widthSize + marginSize.left + marginSize.right} ${heightSize + marginSize.top + marginSize.bottom}`)
    .append("g")
    .attr("transform", `translate(${marginSize.left},${marginSize.top})`);

// Scales
const xSize = d3.scaleLinear().range([0, widthSize]);
const ySize = d3.scaleLinear().range([heightSize, 0]);

// State abbreviation to full name mapping
const stateAbbrevMappingSize = {
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

let allDataSize;

d3.csv("data/processed_wildfire_data.csv").then(function(data) {
    allDataSize = data;
    updateLineChartSize();
});

function updateLineChartSize(stateName) {
  
    svgSize.selectAll("*").remove(); // clear prev info 
    
    let data;
    if (stateName) {
        const stateAbbrev = stateAbbrevMappingSize[stateName];
        data = allDataSize.filter(d => d.STATE === stateAbbrev);
    } else {
        data = allDataSize;
    }
    
    const yearlyData = d3.rollup(data, 
        v => d3.sum(v, d => +d.Total_Fire_Size), 
        d => d.Year
    );

    // Convert to array of objects
    const fireSizeByYear = Array.from(yearlyData, ([year, size]) => ({Year: +year, Total_Fire_Size: size}));

    // Sort by year
    fireSizeByYear.sort((a, b) => a.Year - b.Year);

    // Update scales
    xSize.domain(d3.extent(fireSizeByYear, d => d.Year));
    ySize.domain([0, d3.max(fireSizeByYear, d => d.Total_Fire_Size)]);

    // Create line
    const line = d3.line()
        .x(d => xSize(d.Year))
        .y(d => d.Total_Fire_Size > 0 ? ySize(d.Total_Fire_Size) : ySize.range()[0])
        .defined(d => d.Total_Fire_Size > 0);

    // Add line to chart
    svgSize.append("path")
        .datum(fireSizeByYear)
        .attr("fill", "none")
        .attr("stroke", "#E8864E")
        .attr("stroke-width", 2)
        .attr("d", line);

    // Add x-axis
    svgSize.append("g")
        .attr("transform", `translate(0,${heightSize})`)
        .call(d3.axisBottom(xSize).ticks(10).tickFormat(d3.format("d")));

    // Add y-axis
    svgSize.append("g")
        .call(d3.axisLeft(ySize));

    // Add labels
    svgSize.append("text")
        .attr("x", widthSize / 2)
        .attr("y", heightSize + marginSize.bottom)
        .attr("text-anchor", "middle")
        .text("Year");

    svgSize.append("text")
        .attr("transform", "rotate(-90)")
        .attr("y", 0 - marginSize.left)
        .attr("x", 0 - (heightSize / 2))
        .attr("dy", "1em")
        .attr("text-anchor", "middle")
        .text("Total Fire Size (acres)");

    // Add title
    svgSize.append("text")
        .attr("x", widthSize / 2)
        .attr("y", 0 - marginSize.top / 2)
        .attr("text-anchor", "middle")
        .style("font-size", "16px")
        .text(stateName ? `Total Fire Size in ${stateName} by Year` : "Total Fire Size by Year");
}

window.updateLineChartSize = updateLineChartSize;
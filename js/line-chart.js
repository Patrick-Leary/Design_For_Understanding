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

// Function to update chart dimensions
function updateChart() {
    const containerWidth = document.getElementById("chart-container").clientWidth;
    width = containerWidth - margin.left - margin.right;
    height = (width * 0.5) - margin.top - margin.bottom; // Maintain aspect ratio

    // Update SVG viewBox
    d3.select("#line-chart svg")
        .attr("viewBox", `0 0 ${width + margin.left + margin.right} ${height + margin.top + margin.bottom}`);

    // Update scales
    x.range([0, width]);
    y.range([height, 0]);

    // Update line
    svg.select(".line")
        .attr("d", line);

    // Update axes
    svg.select(".x-axis")
        .attr("transform", `translate(0,${height})`)
        .call(d3.axisBottom(x).ticks(10).tickFormat(d3.format("d")));
    svg.select(".y-axis")
        .call(d3.axisLeft(y));

    // Update labels
    svg.select(".x-label")
        .attr("x", width / 2)
        .attr("y", height + margin.bottom);
    svg.select(".y-label")
        .attr("x", 0 - (height / 2));
    svg.select(".title")
        .attr("x", width / 2);
}

// Load and process the data
d3.csv("data/processed_wildfire_data.csv").then(function(data) {
    // Group by year and sum total fires
    const yearlyData = d3.rollup(data, 
        v => d3.sum(v, d => +d.Total_Fires), 
        d => d.Year
    );

    // Convert to array of objects
    const firesByYear = Array.from(yearlyData, ([year, fires]) => ({Year: +year, Total_Fires: fires}));

    // Sort by year
    firesByYear.sort((a, b) => a.Year - b.Year);

    // Set up scales
    const x = d3.scaleLinear()
        .domain(d3.extent(firesByYear, d => d.Year))
        .range([0, width]);

    const y = d3.scaleLinear()
        .domain([0, d3.max(firesByYear, d => d.Total_Fires)])
        .range([height, 0]);

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
        .text("Total Fires by Year");
});

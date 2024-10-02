// Set up dimensions
const marginSize = {top: 50, right: 30, bottom: 30, left: 90};
let widthSize = 900 - marginSize.left - marginSize.right;
let heightSize = 450 - marginSize.top - marginSize.bottom;

// Create SVG
const svgSize = d3.select("#line-chart-size")
    .append("svg")
    .attr("viewBox", `0 0 ${widthSize + marginSize.left + marginSize.right} ${heightSize + marginSize.top + marginSize.bottom}`)
    .append("g")
    .attr("transform", `translate(${marginSize.left},${marginSize.top})`);

// Function to update chart dimensions
function updateChartSize() {
    const containerWidth = document.getElementById("line-chart-container-size").clientWidth;
    widthSize = containerWidth - marginSize.left - marginSize.right;
    heightSize = (widthSize * 0.5) - marginSize.top - marginSize.bottom; // Maintain aspect ratio

    // Update SVG viewBox
    d3.select("#line-chart-size svg")
        .attr("viewBox", `0 0 ${widthSize + marginSize.left + marginSize.right} ${heightSize + marginSize.top + marginSize.bottom}`);

    // Update scales
    x.range([0, widthSize]);
    y.range([heightSize, 0]);

    // Update line
    svgSize.select(".line")
        .attr("d", line);

    // Update axes
    svgSize.select(".x-axis")
        .attr("transform", `translate(0,${heightSize})`)
        .call(d3.axisBottom(x).ticks(10).tickFormat(d3.format("d")));
    svgSize.select(".y-axis")
        .call(d3.axisLeft(y));

    // Update labels
    svgSize.select(".x-label")
        .attr("x", widthSize / 2)
        .attr("y", heightSize + marginSize.bottom);
    svgSize.select(".y-label")
        .attr("x", 0 - (heightSize / 2));
    svgSize.select(".title")
        .attr("x", widthSize / 2);
}

// Load and process the data
d3.csv("data/processed_wildfire_data.csv").then(function(data) {
    // Group by year and sum total fire size
    const yearlyData = d3.rollup(data, 
        v => d3.sum(v, d => +d.Total_Fire_Size), 
        d => d.Year
    );

    // Convert to array of objects
    const fireSizeByYear = Array.from(yearlyData, ([year, size]) => ({Year: +year, Total_Fire_Size: size}));

    // Sort by year
    fireSizeByYear.sort((a, b) => a.Year - b.Year);

    // Set up scales
    const x = d3.scaleLinear()
        .domain(d3.extent(fireSizeByYear, d => d.Year))
        .range([0, widthSize]);

    const y = d3.scaleLinear()
        .domain([0, d3.max(fireSizeByYear, d => d.Total_Fire_Size)])
        .range([heightSize, 0]);

    // Create line
    const line = d3.line()
        .x(d => x(d.Year))
        .y(d => y(d.Total_Fire_Size));

    // Add line to chart
    svgSize.append("path")
        .datum(fireSizeByYear)
        .attr("fill", "none")
        .attr("stroke", "orange")
        .attr("stroke-width", 2)
        .attr("d", line);

    // Add x-axis
    svgSize.append("g")
        .attr("transform", `translate(0,${heightSize})`)
        .call(d3.axisBottom(x).ticks(10).tickFormat(d3.format("d")));

    // Add y-axis
    svgSize.append("g")
        .call(d3.axisLeft(y));

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
        .text("Total Fire Size by Year");
});
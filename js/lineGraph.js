// data file to access
const filename ="data/avg_firesize_yearly.csv";

// Set the dimensions of the canvas
const margin = { top: 50, right: 50, bottom: 50, left: 55 };
const width = 800 - margin.left - margin.right;
const height = 500 - margin.top - margin.bottom;

// Append the SVG canvas to the body
const svg = d3
  .select(".visual-3 svg")
  .attr("width", width + margin.left + margin.right)
  .attr("height", height + margin.top + margin.bottom)
  .append("g")
  .attr("transform", "translate(" + margin.left + "," + margin.top + ")");

// Load the CSV data
d3.csv(filename).then((data) => {
  // Parse the data
  data.forEach((d) => {
    d.Year = +d.Year;
    d.Average_Fire_Size = +d.Average_Fire_Size;
  });

  // Define scales
  const x = d3
    .scaleLinear()
    .domain(d3.extent(data, (d) => d.Year))
    .range([0, width]);

  const y = d3
    .scaleLinear()
    .domain([0, d3.max(data, (d) => d.Average_Fire_Size)])
    .range([height, 0]);

  // Define the line
  const line = d3
    .line()
    .x((d) => x(d.Year))
    .y((d) => y(d.Average_Fire_Size));

  // Append the line to the graph
  svg.append("path").datum(data).attr("class", "line").attr("d", line);

  // Add X Axis
  svg
    .append("g")
    .attr("transform", "translate(0," + height + ")")
    .call(d3.axisBottom(x).tickFormat(d3.format("d"))); // Format as year

  // Add Y Axis
  svg.append("g").call(d3.axisLeft(y));

  // Add labels
  svg
    .append("text")
    .attr("x", width / 2)
    .attr("y", height + margin.bottom - 10)
    .attr("text-anchor", "middle")
    .text("Year");

    svg
    .append("text")
    .attr("text-anchor", "middle")
    .attr(
      "transform",
      "translate(" + -margin.left * 0.8 + "," + height / 2 + ")rotate(-90)"
    )
    .text("Average Fire Size (Acres)");

  // Function to calculate the line of best fit
  function linearRegression(data) {
    const n = data.length;
    const sumX = d3.sum(data, (d) => d.Year);
    const sumY = d3.sum(data, (d) => d.Average_Fire_Size);
    const sumXY = d3.sum(data, (d) => d.Year * d.Average_Fire_Size);
    const sumX2 = d3.sum(data, (d) => d.Year * d.Year);

    const slope = (n * sumXY - sumX * sumY) / (n * sumX2 - sumX * sumX);
    const intercept = (sumY - slope * sumX) / n;

    return { slope, intercept };
  }

  // Calculate the line of best fit
  const { slope, intercept } = linearRegression(data);

  // Create the trendline points
  const trendline = [
    {
      Year: d3.min(data, (d) => d.Year),
      Average_Fire_Size: intercept + slope * d3.min(data, (d) => d.Year),
    },
    {
      Year: d3.max(data, (d) => d.Year),
      Average_Fire_Size: intercept + slope * d3.max(data, (d) => d.Year),
    },
  ];

  // Add the trendline to the graph
  const trendlinePath = d3
    .line()
    .x((d) => x(d.Year))
    .y((d) => y(d.Average_Fire_Size));

  svg
    .append("path")
    .datum(trendline)
    .attr("class", "trendline")
    .attr("d", trendlinePath);
});

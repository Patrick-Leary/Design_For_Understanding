// data file to access
const filenameSP = "data/filtered_firesize_data.csv";

// Set the dimensions and margins of the graph
const marginSP = { top: 20, right: 150, bottom: 40, left: 50 },  // Increased right margin for the legend
  widthSP = 800 - marginSP.left - marginSP.right,
  heightSP = 600 - marginSP.top - marginSP.bottom;

// Append the SVG object to the body of the page
let svgSP = d3
  .select(".visual-2 svg")
  .append("g")
  .attr("transform", `translate(${marginSP.left},${marginSP.top})`);

// Load the data
d3.csv(filenameSP).then((data) => {
  // Convert the FIRE_SIZE and Days_to_extinguish_fire to numeric values
  data.forEach((d) => {
    d.FIRE_SIZE = +d.FIRE_SIZE;
    d.Days_to_extinguish_fire = +d.Days_to_extinguish_fire;
    d.YEAR = +d.YEAR; // Ensure YEAR is numeric
  });

  // Set the scales
  const x = d3
    .scaleLinear()
    .domain(d3.extent(data, (d) => d.FIRE_SIZE))
    .nice()
    .range([0, widthSP]);

  const y = d3
    .scaleLinear()
    .domain([0, d3.max(data, (d) => d.Days_to_extinguish_fire)])
    .nice()
    .range([heightSP, 0]);

  // Define a color scale for the years
  const colorScale = d3.scaleSequential()
  .domain([1992, 2015]) // Domain from 1992 to 2015
  .interpolator(d3.interpolateInferno); // Using a blue color interpolation


  // Add the X Axis
  svgSP
    .append("g")
    .attr("class", "axis axis--x")
    .attr("transform", `translate(0, ${heightSP})`)
    .call(d3.axisBottom(x));

  // Add the Y Axis
  svgSP.append("g").attr("class", "axis axis--y").call(d3.axisLeft(y));

   // Add X Axis Label
  svgSP
    .append("text")
    .attr("class", "x-axis-label")
    .attr("text-anchor", "middle")
    .attr("x", widthSP / 2)
    .attr("y", heightSP + marginSP.bottom - 10)
    .text("Fire Size (Acres)");

  // Add Y Axis Label
  svgSP
    .append("text")
    .attr("class", "y-axis-label")
    .attr("text-anchor", "middle")
    .attr("transform", "rotate(-90)")
    .attr("y", -marginSP.left + 10)
    .attr("x", -heightSP / 2)
    .text("Days to Extinguish Fire");

  // Add the scatter points with color based on year
  svgSP
    .selectAll(".scatter")
    .data(data)
    .enter()
    .append("circle")
    .attr("class", "scatter")
    .attr("cx", (d) => x(d.FIRE_SIZE))
    .attr("cy", (d) => y(d.Days_to_extinguish_fire))
    .attr("r", 5)
    .attr("fill", (d) => colorScale(d.FIRE_YEAR)); // Fill color based on year

 

  // Create a legend group
  const legendGroup = svgSP.append("g")
    .attr("transform", `translate(${widthSP + 40}, 20)`); // Adjust as needed for position

  // Define years for the legend
  const years = d3.range(1992, 2016); // Years from 1992 to 2015

  // Add legend rectangles and text
  years.forEach((year, i) => {
    legendGroup.append("rect")
      .attr("x", 0)
      .attr("y", i * 20) // Spacing between legend items
      .attr("width", 20)
      .attr("height", 15)
      .attr("fill", colorScale(year)); // Fill based on year

    legendGroup.append("text")
      .attr("x", 30) // Space for text to the right of the rectangle
      .attr("y", i * 20 + 12) // Align vertically with the rectangle
      .text(year);
  });
});
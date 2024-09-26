// Set the dimensions and margins of the graph
const margin = {top: 30, right: 30, bottom: 60, left: 60},
    width = 600 - margin.left - margin.right,
    height = 400 - margin.top - margin.bottom;

// Append the svg object to the body of the page
const svg = d3.select("#chart")
  .append("svg")
    .attr("width", width + margin.left + margin.right)
    .attr("height", height + margin.top + margin.bottom)
  .append("g")
    .attr("transform", `translate(${margin.left},${margin.top})`);

// Read the data
d3.csv("data/StudentPerformanceFactors.csv").then(function(data) {

  // Add X axis
  const x = d3.scaleLinear()
    .domain([0, d3.max(data, d => +d.Previous_Scores)])
    .range([ 0, width ]);
  svg.append("g")
    .attr("transform", `translate(0, ${height})`)
    .call(d3.axisBottom(x));

  // Add Y axis
  const y = d3.scaleLinear()
    .domain([0, 100])  // Assuming exam scores are out of 100
    .range([ height, 0]);
  svg.append("g")
    .call(d3.axisLeft(y));

  // Add dots
  svg.append('g')
    .selectAll("dot")
    .data(data)
    .join("circle")
      .attr("cx", d => x(d.Previous_Scores))
      .attr("cy", d => y(d.Exam_Score))
      .attr("r", 3)
      .style("fill", "#69b3a2")
      .style("opacity", 0.5);

  // Add trend line
  const trendLine = d3.line()
    .x(d => x(d.Previous_Scores))
    .y(d => y(d.yhat));

  const regression = d3.regressionLinear()
    .x(d => +d.Previous_Scores)
    .y(d => +d.Exam_Score);

  const regressionLine = regression(data);


  svg.append("path")
    .datum(regressionLine)
    .attr("fill", "none")
    .attr("stroke", "red")
    .attr("stroke-width", 1.5)
    .attr("d", trendLine);

  // Add X axis label
  svg.append("text")
    .attr("text-anchor", "end")
    .attr("x", width)
    .attr("y", height + margin.top + 20)
    .text("Hours Studied");

  // Add Y axis label
  svg.append("text")
    .attr("text-anchor", "end")
    .attr("transform", "rotate(-90)")
    .attr("y", -margin.left + 20)
    .attr("x", -margin.top)
    .text("Exam Score");

  // Add title
  svg.append("text")
    .attr("x", (width / 2))             
    .attr("y", 0 - (margin.top / 2))
    .attr("text-anchor", "middle")  
    .style("font-size", "16px") 
    .style("text-decoration", "underline")  
    .text("Hours Studied vs Exam Score");

});
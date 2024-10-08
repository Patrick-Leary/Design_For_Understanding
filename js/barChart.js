// data file to access
const filenameBC = "data/avg_extinguishing_yearly.csv";

const marginBC = { top: 20, right: 30, bottom: 40, left: 60 };
const widthBC = 800 - marginBC.left - marginBC.right;
const heightBC = 600 - marginBC.top - marginBC.bottom;

const HEIGHT_ADJUST = 10;

// Create the SVG container for the bar chart
const svgBC = d3
  .select(".visual-2 svg")
  .attr("width", widthBC + marginBC.left + marginBC.right)
  .attr("height", heightBC + marginBC.top + marginBC.bottom)
  .append("g")
  .attr("transform", `translate(${marginBC.left},${marginBC.top})`);

// Load CSV data
d3.csv(filenameBC)
  .then((data) => {
    // Convert the values to numbers
    data.forEach((d) => (d.value = +d.value));
    
    // X scale
    const x = d3
      .scaleBand()
      .domain(data.map((d) => d.Year))
      .range([0, widthBC])
      .padding(0.1);

    // Y scale
    const y = d3
      .scaleLinear()
      .domain([0, d3.max(data, (d) => d.Average_Extinguish_Time)])
      .range([heightBC-HEIGHT_ADJUST, 0]);

    // X axis
    svgBC
      .append("g")
      .attr("transform", `translate(0,${heightBC-HEIGHT_ADJUST})`)
      .call(d3.axisBottom(x))
      .selectAll("text")
      .attr("transform", "rotate(-45)")
      .style("text-anchor", "end");

    // Y axis
    svgBC.append("g").call(d3.axisLeft(y));

    // Add x-axis label
    svgBC
      .append("text")
      .attr("class", "x-axis-label")
      .attr("x", widthBC / 2) // Center the label horizontally
      .attr("y", heightBC + margin.bottom - 15) // Position it below the x-axis
      .attr("text-anchor", "middle")
      .text("Year");

    // Add y-axis label
    svgBC
      .append("text")
      .attr("class", "y-axis-label")
      .attr("x", -(heightBC / 2)) // Center the label vertically
      .attr("y", -marginBC.left + 20) // Position it to the left of the y-axis
      .attr("transform", "rotate(-90)") // Rotate the label
      .attr("text-anchor", "middle")
      .text("Average Time to Extinguish (days)");

    // Create tooltip
    const tooltip = d3
      .select("body")
      .append("div")
      .style("position", "absolute")
      .style("visibility", "hidden")
      .style("background-color", "white")
      .style("border", "1px solid #5D7392")
      .style("padding", "5px")
      .style("border-radius", "5px");

    // Add bars
    svgBC
      .selectAll(".bar")
      .data(data)
      .enter()
      .append("rect")
      .attr("class", "bar")
      .attr("x", (d) => x(d.Year))
      .attr("y", (d) => y(d.Average_Extinguish_Time))
      .attr("width", x.bandwidth())
      .attr("height", (d) => heightBC - HEIGHT_ADJUST - y(d.Average_Extinguish_Time))
      .attr("fill", "#69b3a2")
      .on("mouseover", function (event, d) {
        d3.select(this).classed("hovered", true);
        tooltip
          .html(
            `<b>Year:</b> ${d.Year}<br> 
             <b>Avg. Extinguish Time:</b> ${Number(d.Average_Extinguish_Time).toFixed(2)} days <br>
             <b>Total Fires: </b> ${d.Total_Fires}<br>
             <b>Total Extinguish Time: </b> ${d.Total_Extinguish} days`
          )
          .style("visibility", "visible");
        
      })
      .on("mousemove", function (event) {
        tooltip
          .style("top", event.pageY - 10 + "px")
          .style("left", event.pageX + 10 + "px");
      })
      .on("mouseout", function () {
        d3.select(this).classed("hovered", false);
        tooltip.style("visibility", "hidden");
      });
  })
  .catch((error) => {
    console.error("Error loading the CSV file:", error);
  });

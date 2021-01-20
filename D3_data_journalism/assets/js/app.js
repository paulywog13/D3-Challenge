// @TODO: YOUR CODE HERE!
var svgWidth = 800;
var svgHeight = 600;

var margin = {
  top: 20,
  right: 20,
  bottom: 60,
  left: 50
};

var width = svgWidth - margin.left - margin.right;
var height = svgHeight - margin.top - margin.bottom;

// Create an SVG wrapper, append an SVG group that will hold our chart, 
// and shift the latter by left and top margins.
var svg = d3.select("#scatter")
  .append("svg")
  .attr("width", svgWidth)
  .attr("height", svgHeight);

var chartGroup = svg.append("g")
  .attr("transform", `translate(${margin.left}, ${margin.top})`);

// Import Data
d3.csv("./assets/data/data.csv").then(function(healthData) {
    
     // Step 1: Parse Data/Cast as numbers
    // ==============================
    healthData.forEach(function(data) {
        data.obesity = +data.obesity;
        data.poverty = +data.poverty;
      });
    // Step 2: Create scale functions
    // ==============================
    var xLinearScale = d3.scaleLinear()
      .domain([d3.min(healthData, d => d.poverty)*0.8, d3.max(healthData, d => d.poverty)*1.05])
      .range([0, width]);

    var yLinearScale = d3.scaleLinear()
      .domain([d3.min(healthData, d => d.obesity)*0.8, d3.max(healthData, d => d.obesity)*1.05])
      .range([height, 0]);

    // Step 3: Create axis functions
    // ==============================
    var bottomAxis = d3.axisBottom(xLinearScale);
    var leftAxis = d3.axisLeft(yLinearScale);

    // Step 4: Append Axes to the chart
    // ==============================
    chartGroup.append("g")
      .attr("transform", `translate(0, ${height})`)
      .call(bottomAxis);

    chartGroup.append("g")
      .call(leftAxis);

    // Step 5: Create Circles
    // ==============================
    var circlesGroup = chartGroup.selectAll("circle")
    .data(healthData)
    .enter()
    .append("circle")
    .attr("cx", d => xLinearScale(d.poverty))
    .attr("cy", d => yLinearScale(d.obesity))
    .attr("r", "12")
    .attr("fill", "lightblue")
    .attr("opacity", ".5");

    //Adding state abbreviations in the circles on the chart
    chartGroup.selectAll()
    .data(healthData)
    .enter()
    .append("text")
    .attr("text-anchor", "middle")
    .attr("font-size", "12px")
    .attr("x", d => xLinearScale(d.poverty))
    .attr("y", d => yLinearScale(d.obesity))
    .attr("r", "8")
    .style("fill", "black")
    .attr("opacity", ".7")
    .text(d => d.abbr)
    .classed("stateText", true);

    // Step 6: Initialize tool tip
    // ==============================
    var toolTip = d3.tip()
      .attr("class", "tooltip")
      .offset([80, -60])
      .html(function(d) {
        return (`${d.state}<br>In Poverty(%): ${d.poverty}<br>Obese(%): ${d.obesity}`);
      });

    // Step 7: Create tooltip in the chart
    // ==============================
    chartGroup.call(toolTip);

    // Step 8: Create event listeners to display and hide the tooltip
    // ==============================
    circlesGroup.on("click", function(data) {
      toolTip.show(data, this);
    })
    
    // on mouseover event to highlight the chart circle selected
    circlesGroup.on("mouseover", function() {
      d3.select(this)
        .transition()
        .duration(800)
        .attr("r", 20)
        .attr("fill", "lightgreen");
    })
      // on mouseout event
      .on("mouseout", function(data, index) {
        d3.select(this)
          .transition()
          .duration(800)
          .attr("r", 12)
          .attr("fill", "lightblue")
          toolTip.hide(data);
      });
      

    
    // Create y axis label
    chartGroup.append("text")
      .attr("transform", "rotate(-90)")
      .attr("y", -margin.left)
      .attr("x", 0 - (height / 2))
      .attr("dy", "1em")
      .attr("class", "axisText")
      .text("Obesity(%)");

    // Create x axis label
    chartGroup.append("text")
      .attr("transform", `translate(${width / 2}, ${height + margin.top + 30})`)
      .attr("class", "axisText")
      .text("Poverty(%)");
  }).catch(function(error) {
    console.log(error);
  });
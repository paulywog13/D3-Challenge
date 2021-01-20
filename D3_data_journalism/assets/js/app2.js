var svgWidth = 800;
var svgHeight = 600;

var margin = {
  top: 20,
  right: 40,
  bottom: 100,
  left: 100
};

var width = svgWidth - margin.left - margin.right;
var height = svgHeight - margin.top - margin.bottom;

// Create an SVG wrapper, append an SVG group that will hold our chart,
// and shift the latter by left and top margins.
var svg = d3.select("#scatter")
  .append("svg")
  .attr("width", svgWidth)
  .attr("height", svgHeight);

// Append an SVG group
var chartGroup = svg.append("g")
  .attr("transform", `translate(${margin.left}, ${margin.top})`);

// Initial Params
var chosenXAxis = "poverty";
var chosenYAxis = "healthcare";

// function used for updating x-scale var upon click on axis label
function xScale(healthData, chosenXAxis) {
  // create scales
  var xLinearScale = d3.scaleLinear()
    .domain([d3.min(healthData, d => d[chosenXAxis]) * 0.8,
      d3.max(healthData, d => d[chosenXAxis]) * 1.05
    ])
    .range([0, width]);

  return xLinearScale;

}
function yScale(healthData, chosenYAxis) {
    // create scales
    var yLinearScale = d3.scaleLinear()
      .domain([d3.min(healthData, d => d[chosenYAxis]) * 0.8,
        d3.max(healthData, d => d[chosenYAxis]) * 1.05
      ])
      .range([height, 0]);
  
    return yLinearScale;
  
  }

// function used for updating xAxis var upon click on axis label
function renderXAxes(newXScale, xAxis) {
  var bottomAxis = d3.axisBottom(newXScale);

  xAxis.transition()
    .duration(1000)
    .call(bottomAxis);

  return xAxis;
}
// function used for updating yAxis var upon click on axis label
function renderYAxes(newYScale, yAxis) {
    var leftAxis = d3.axisLeft(newYScale);
  
    yAxis.transition()
      .duration(1000)
      .call(leftAxis);
  
    return yAxis;
  }

// function used for updating the circles location and x axix scale 
// with a transition to selected label data
function renderXCircles(circlesGroup, newXScale, chosenXAxis) {

  circlesGroup.transition()
    .duration(1000)
    .attr("cx", d => newXScale(d[chosenXAxis]));

  return circlesGroup;
}

// function used for updating the circles location and y axix scale 
// with a transition to selected label data
function renderYCircles(circlesGroup, newYScale, chosenYAxis) {

    circlesGroup.transition()
      .duration(1000)
      .attr("cy", d => newYScale(d[chosenYAxis]));
  
    return circlesGroup;
}

// function used for updating the state abbreviation data location on the  
// x axis with a transition to selected label data
function renderXCirclesText(TextGroup, newXScale, chosenXAxis) {

    TextGroup.transition()
      .duration(1000)
      .attr("x", d => newXScale(d[chosenXAxis]));
  
    return TextGroup;
  }
// function used for updating the state abbreviation text data location on the  
// y axis with a transition to selected label data
function renderYCirclesText(TextGroup, newYScale, chosenYAxis) {

    TextGroup.transition()
      .duration(1000)
      .attr("y", d => newYScale(d[chosenYAxis]));
  
    return TextGroup;
}
// function used for updating circles group with new tooltip
function updateToolTip(chosenXAxis, chosenYAxis, circlesGroup) {

  var labelx;
  var labely;
  var labelposition = [80, -60]

  if (chosenXAxis === "poverty") {
    labelx = "Poverty:";
  }
  else if (chosenXAxis === "age") {
    labelx = "Age:";
    labelposition = [80, -60];
  }
  else {
      labelx = "Income:";
      labelposition = [80, -60];
  }
  if (chosenYAxis === "obesity") {
    labely = "Obese";
  }
  else if (chosenYAxis === "smokes") {
    labely = "Smokes";
  }
  else {
      labely = "Healthcare";
  }


  var toolTip = d3.tip()
    .attr("class", "tooltip")
    .offset(labelposition)
    .html(function(d) {
      return (`${d.state}<br>${labelx} ${d[chosenXAxis]}<br>${labely} ${d[chosenYAxis]}`);
    });

  circlesGroup.call(toolTip);

  // on mouseover event to highlight the chart circle selected
  circlesGroup.on("mouseover", function(data) {
    d3.select(this)
      .transition()
      .duration(600)
      .attr("r", 20)
      toolTip.show(data, this);
  })
    // onmouseout event
    .on("mouseout", function(data, index) {
      d3.select(this)
          .transition()
          .duration(600)
          .attr("r", 12)
          .attr("fill", "lightblue")
      toolTip.hide(data);
    });

  return circlesGroup;
}

// Retrieve data from the CSV file and execute everything below
d3.csv("./assets/data/data.csv").then(function(healthData) {
  // if (err) throw err;

  // parse data
  healthData.forEach(function(data) {
    data.poverty = +data.poverty;
    data.age = +data.age;
    data.income = +data.income;
    data.obesity = +data.obesity;
    data.smokes = +data.smokes;
    data.healthcare = +data.healthcare;
  });

  // xLinearScale function above csv import
  var xLinearScale = xScale(healthData, chosenXAxis);
  var yLinearScale = yScale(healthData, chosenYAxis);

  // Create initial axis functions
  var bottomAxis = d3.axisBottom(xLinearScale);
  var leftAxis = d3.axisLeft(yLinearScale);

  // append x axis
  var xAxis = chartGroup.append("g")
    .classed("x-axis", true)
    .attr("transform", `translate(0, ${height})`)
    .call(bottomAxis);

  // append y axis
  var yAxis = chartGroup.append("g")
    .call(leftAxis);

  // append initial circles
  var dataCircles = chartGroup.selectAll("circlesGroup")
    .data(healthData)
    .enter()
    var circlesGroup = dataCircles
    .append("circle")
    .attr("cx", d => xLinearScale(d[chosenXAxis]))
    .attr("cy", d => yLinearScale(d[chosenYAxis]))
    .attr("r", "12")
    .attr("fill", "lightblue")
    .attr("opacity", ".5")
    .classed("stateCircle", true);

  var TextGroup= dataCircles
    .append("text")
    .attr("text-anchor", "middle")
    .attr("font-size", "11px")
    .text(d => d.abbr)
    .attr("x", d => xLinearScale(d[chosenXAxis]))
    .attr("y", d => yLinearScale(d[chosenYAxis]))
    .style("fill", "black")
    .attr("opacity", ".7")
    .classed("stateText", true);

  // Create group for 3 x-axis labels
  var xlabelsGroup = chartGroup.append("g")
    .attr("transform", `translate(${width / 2}, ${height + 20})`);

  var povertyLabel = xlabelsGroup.append("text")
    .attr("x", 0)
    .attr("y", 20)
    .attr("value", "poverty") // value to grab for event listener
    .classed("active", true)
    .text("In Poverty (%)");

  var ageLabel = xlabelsGroup.append("text")
    .attr("x", 0)
    .attr("y", 40)
    .attr("value", "age") // value to grab for event listener
    .classed("inactive", true)
    .text("Age (Median)");

  var incomeLabel = xlabelsGroup.append("text")
    .attr("x", 0)
    .attr("y", 60)
    .attr("value", "income") // value to grab for event listener
    .classed("inactive", true)
    .text("Household Income (Median)");
  
  // Create group for 3 y-axis labels
  var ylabelsGroup = chartGroup.append("g")
  .attr("transform", "rotate(-90)")

  var obeseLabel = ylabelsGroup.append("text")
    .attr("y", 10 - margin.left)
    .attr("x", 0 - (height / 2))
    .attr("dy", "1em")
    .attr("value", "obesity") // value to grab for event listener
    .classed("inactive", true)
    .text("Obese (%)");

  var smokesLabel = ylabelsGroup.append("text")
    .attr("y", 30 - margin.left)
    .attr("x", 0 - (height / 2))
    .attr("dy", "1em")
    .attr("value", "smokes") // value to grab for event listener
    .classed("inactive", true)
    .text("Smokes (%)");

  var healthcareLabel = ylabelsGroup.append("text")
    .attr("y", 50 - margin.left)
    .attr("x", 0 - (height / 2))
    .attr("dy", "1em")
    .attr("value", "healthcare") // value to grab for event listener
    .classed("active", true)
    .text("Lacks Healthcare (%)");

  // updateToolTip function above csv import
  var circlesGroup = updateToolTip(chosenXAxis, chosenYAxis, circlesGroup);

  // x axis labels event listener
  xlabelsGroup.selectAll("text")
    .on("click", function() {
      // get value of selection
      var value = d3.select(this).attr("value");
      if (value !== chosenXAxis) {

        // replaces chosenXAxis with value
        chosenXAxis = value;

        // console.log(chosenXAxis)

        // functions here found above csv import
        // updates x scale for new data
        xLinearScale = xScale(healthData, chosenXAxis);

        // updates x axis with transition
        xAxis = renderXAxes(xLinearScale, xAxis);

        // updates circles with new x values
        circlesGroup = renderXCircles(circlesGroup, xLinearScale, chosenXAxis);
        TextGroup = renderXCirclesText(TextGroup, xLinearScale, chosenXAxis);
        // updates tooltips with new info
        circlesGroup = updateToolTip(chosenXAxis, chosenYAxis, circlesGroup);

        // changes classes to change bold text
        if (chosenXAxis === "poverty") {
         povertyLabel
            .classed("active", true)
            .classed("inactive", false);
          ageLabel
            .classed("active", false)
            .classed("inactive", true);
          incomeLabel
            .classed("active", false)
            .classed("inactive", true);
        }
        else if (chosenXAxis === "age") {
          povertyLabel
            .classed("active", false)
            .classed("inactive", true);
          ageLabel
            .classed("active", true)
            .classed("inactive", false);
          incomeLabel
            .classed("active", false)
            .classed("inactive", true);
        }
        else {
          povertyLabel
            .classed("active", false)
            .classed("inactive", true);
          ageLabel
            .classed("active", false)
            .classed("inactive", true);
          incomeLabel
            .classed("active", true)
            .classed("inactive", false);
        }
      }
    });
    // y axis labels event listener
  ylabelsGroup.selectAll("text")
  .on("click", function() {
    // get value of selection
    var value = d3.select(this).attr("value");
    if (value !== chosenYAxis) {

      // replaces chosenXAxis with value
      chosenYAxis = value;

      // console.log(chosenXAxis)

      // functions here found above csv import
      // updates x scale for new data
      yLinearScale = yScale(healthData, chosenYAxis);

      // updates x axis with transition
      yAxis = renderYAxes(yLinearScale, yAxis);
      TextGroup = renderYCirclesText(TextGroup, yLinearScale, chosenYAxis)
      // updates circles with new x values
      circlesGroup = renderYCircles(circlesGroup, yLinearScale, chosenYAxis);

      // updates tooltips with new info
      circlesGroup = updateToolTip(chosenXAxis, chosenYAxis, circlesGroup);

      // changes classes to change bold text
      if (chosenYAxis === "obesity") {
       obeseLabel
          .classed("active", true)
          .classed("inactive", false);
        smokesLabel
          .classed("active", false)
          .classed("inactive", true);
        healthcareLabel
          .classed("active", false)
          .classed("inactive", true);
      }
      else if (chosenYAxis === "smokes") {
        obeseLabel
          .classed("active", false)
          .classed("inactive", true);
        smokesLabel
          .classed("active", true)
          .classed("inactive", false);
        healthcareLabel
          .classed("active", false)
          .classed("inactive", true);
      }
      else {
        obeseLabel
          .classed("active", false)
          .classed("inactive", true);
        smokesLabel
          .classed("active", false)
          .classed("inactive", true);
        healthcareLabel
          .classed("active", true)
          .classed("inactive", false);
      }
    }
  });
}).catch(function(error) {
  console.log(error);
});

//      // Step 1: Parse Data/Cast as numbers
//     // ==============================
//     healthData.forEach(function(data) {
//         data.obesity = +data.obesity;
//         data.poverty = +data.poverty;
//       });
//     // Step 2: Create scale functions
//     // ==============================
//     var xLinearScale = d3.scaleLinear()
//       .domain([d3.min(healthData, d => d.poverty)*0.8, d3.max(healthData, d => d.poverty)*1.05])
//       .range([0, width]);

//     var yLinearScale = d3.scaleLinear()
//       .domain([d3.min(healthData, d => d.obesity)*0.8, d3.max(healthData, d => d.obesity)*1.05])
//       .range([height, 0]);

//     // Step 3: Create axis functions
//     // ==============================
//     var bottomAxis = d3.axisBottom(xLinearScale);
//     var leftAxis = d3.axisLeft(yLinearScale);

//     // Step 4: Append Axes to the chart
//     // ==============================
//     chartGroup.append("g")
//       .attr("transform", `translate(0, ${height})`)
//       .call(bottomAxis);

//     chartGroup.append("g")
//       .call(leftAxis);

//     // Step 5: Create Circles
//     // ==============================
//     var circlesGroup = chartGroup.selectAll("circle")
//     .data(healthData)
//     .enter()
//     .append("circle")
//     .attr("cx", d => xLinearScale(d.poverty))
//     .attr("cy", d => yLinearScale(d.obesity))
//     .attr("r", "15")
//     .attr("fill", "lightblue")
//     .attr("opacity", ".5");

//     //Adding state abbreviations in the circles on the chart
//     chartGroup.selectAll()
//     .data(healthData)
//     .enter()
//     .append("text")
//     .attr("text-anchor", "middle")
//     .attr("font-size", "10px")
//     .attr("x", d => xLinearScale(d.poverty))
//     .attr("y", d => yLinearScale(d.obesity))
//     .attr("r", "8")
//     .style("fill", "black")
//     .attr("opacity", ".5")
//     .text(d => d.abbr)
//     .classed("stateText", true);

//     // Step 6: Initialize tool tip
//     // ==============================
//     var toolTip = d3.tip()
//       .attr("class", "tooltip")
//       .offset([80, -60])
//       .html(function(d) {
//         return (`${d.state}<br>Poverty(%): ${d.poverty}<br>Obesity(%): ${d.obesity}`);
//       });

//     // Step 7: Create tooltip in the chart
//     // ==============================
//     chartGroup.call(toolTip);

//     // Step 8: Create event listeners to display and hide the tooltip
//     // ==============================
//     circlesGroup.on("click", function(data) {
//       toolTip.show(data, this);
//     })
//       // onmouseout event
//       .on("mouseout", function(data, index) {
//         toolTip.hide(data);
//       });

//     // Create axes labels
//     chartGroup.append("text")
//       .attr("transform", "rotate(-90)")
//       .attr("y", -margin.left)
//       .attr("x", 0 - (height / 2))
//       .attr("dy", "1em")
//       .attr("class", "axisText")
//       .text("Obesity(%)");

//     chartGroup.append("text")
//       .attr("transform", `translate(${width / 2}, ${height + margin.top + 30})`)
//       .attr("class", "axisText")
//       .text("Poverty(%)");
//   }).catch(function(error) {
//     console.log(error);
//   });
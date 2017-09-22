// diplay the poll result as a bar chart

function displayPoll(poll, chartName){
  
  var data = poll.values
    , labels = poll.option
    , title = poll.title;
  
  var barWidth = 10
    , barMaxHeight = 100
    , height = 150;
  
  var chart = d3.select(chartName).attr("height", height);
  
  var y = d3.scaleLinear().range([0, barMaxHeight]).domain([0, $.max(data)]);
  
  var bar = chart.selectAll('g')
      .data(data)
      .enter().append("g")
      .attr("transform", function(d,i){

        return "translate(" 
          + i * barWidth 
          + ","
          + (height-y(d))
          + ")";
      });
    
    bar.append("rect")
      .attr("width", barWidth - 1)
      .attr("height", y)
}

module.exports = {
  displayPoll : displayPoll
}
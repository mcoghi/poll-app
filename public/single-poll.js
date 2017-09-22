
$(document).ready(function(){
  
  var id = window.location.href.split("id=")[1];
  
  $.get("/polls?" + $.param({id : id}), function(res){
    
    // display title
    $('h1').html(res[0].title);
    $('.graph-subtitle').html("by " + res[0].username);
    // display poll
    displayPoll(res[0], ".chart");
    
  })
  
})



// a D3 function that creates the bar graph

function displayPoll(poll, chartName){
  
  var title = poll.title
      ,data = poll.options.map(function(value, index){
    return {x: value, y: poll.votes[index]}
  })
  
  var barWidth = Math.min(100, 500 / data.length)
    , width = barWidth * data.length
    , height = 500
    , margin = 10
    , paddingVertical = 50
    , paddingOrizontal = 50
    , minHeight = 10;
  
  var chart = d3.select(chartName).attr("height", height).attr("width", 800);

  var maxY = d3.max(data, function(d){
    return d.y
  })
  
  // define y scale
  var y = d3.scaleLinear().range([height - paddingVertical, paddingVertical]).domain([0, maxY]);
  
  // define x scale
  var x = d3.scaleBand()
          .domain(data.map(function(d){
              return d.x;
          }))
          .rangeRound([0, width + margin / 2])
          .padding(0.1);    
  
  
  var bar = chart.selectAll('g')
      .data(data)
      .enter().append("g")
      .attr("transform", function(d, i){
        
        var dataHeight = Math.max(minHeight, y(0) - y(d.y));
        
        return "translate(" 
          + (paddingOrizontal + margin/2 + i * barWidth)
          + ","
          + (height - paddingVertical - dataHeight)
          + ")";
      }).on("click", function(d, i){
        console.log('you clicked' + d.x);
        console.log(poll._id);
        
        $.post("/castvote?" + $.param({id: poll._id, option: d.x}), function(){
          console.log('vote successful');
          location.reload(true);
        })
        
      });
    
  bar.append("rect")
    .attr("width", barWidth - margin / 2)
    .attr("height", function(d){
      if (y(0) - y(d.y) == 0){
        return minHeight
      } else {
        return y(0) - y(d.y);
      }
  })

  
  // define the y axis
  var yAxis = d3.axisLeft()
              .scale(y)
              .ticks(maxY)
              .tickFormat(d3.format("d"));
  
  // define the x axis
  var xAxis = d3.axisBottom()
              .scale(x)

  // draw y axis with labels and move in from the size by the amount of padding
  chart.append("g")
    .attr("transform", "translate(" + paddingOrizontal + "," + 0 + ")")
    .call(yAxis);
  
  // draw x axis
  chart.append("g")
    .attr("transform", "translate(" + paddingOrizontal + "," + (height - paddingVertical) + ")")
    .call(xAxis);
}


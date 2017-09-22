var allPolls;

$(document).ready(function(){
  
  $.get("/user", function(user){
    if(user){
      $("#home").removeClass("hidden");
      $("#log-out").removeClass("hidden");
    }else{
      $("#log-in").removeClass("hidden");
      $("#sign-up").removeClass("hidden");
    }
  })
  
  // get all the polls
  $.get("/polls", function(polls){
       
    allPolls = polls;
    console.log(allPolls);
    
    polls.map(function(value, index){
      
      var str = "<div "
              + "class='poll";
      
      if (index == 0) str += " on-display" ;
      
      str += "' "
          + "id=" 
          + value._id
          + ">"
          + "<b>" + value.title + "</b>"
          + " by: " + value.username
          + "<div class='btn btn-success single-poll";
      
      if (index !=0) str += " hidden";
        
      str +="'> -> </div>"

          + "</div>";
      
      $(".poll-list").append(str);
      
    })
    
    if (polls.length > 0){

      $(".graph-title").html(polls[0].title)
      $(".graph-subtitle").html("by: " + polls[0].username);
 
      displayPoll(polls[0], ".chart");
      
    }
    
    // click on green button to open graph in new page
    $(".single-poll").on("click", function(){
      console.log($(this).parent().attr("id"))
      window.location.replace("/poll?" + $.param({id: $(this).parent().attr("id")}))
    })
    
    // click on poll to show its graph
    $(".poll").on("click", function(){
      console.log("you clicked on " + $(this).attr("id"));
      
      // hide the selected polls
      $(".poll").removeClass("on-display");
      $(".single-poll").addClass("hidden");
      
      $(this).addClass("on-display");
      $(this).children(".single-poll").removeClass("hidden");
      
      // empty the graph
      $('.chart').html('');

      
      // select the correct one to show, and show it
      for (var i = 0; i < allPolls.length; i++){
        
        if (allPolls[i]._id == $(this).attr("id")){
          
          var tmp = allPolls[i];

          $(".graph-title").html(tmp.title);
          $(".graph-subtitle").html("by: " + tmp.username);
          
          displayPoll(allPolls[i], '.chart');
        }
      }
      
    })
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
  console.log("attaching yAxis")
  chart.append("g")
    .attr("transform", "translate(" + paddingOrizontal + "," + 0 + ")")
    .call(yAxis);
  
  // draw x axis
  chart.append("g")
    .attr("transform", "translate(" + paddingOrizontal + "," + (height - paddingVertical) + ")")
    .call(xAxis);

}

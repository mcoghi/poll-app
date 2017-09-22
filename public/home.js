var allPolls;

$(document).ready(function(){
  
  $.get("/user", function(user){
    
    // append the username to the title
    $("h1").append(user.username);
    
  })
  
  // get the polls of the specific user
  $.get("/mypolls", function(polls){
    
    allPolls = polls
    console.log(allPolls);
    
    $(".poll-list").append("<div class='poll' id='poll-form'>Create new poll</div>")
    
    polls.map(function(value, index){
      
      // create the clickable bar containing the title of each poll
      var str = "<div "
              + "class='poll";
      
      if (index == 0) str += " on-display" ; //the first one is the selected one
      
      str += "' "
          + "id=" 
          + value._id
          + ">"
          + "<b class='bar-title'>" + value.title + "</b>"
          + "<div class='btn btn-danger delete-button hidden'>Delete</div>" // add the DELETE button
          + "<div class='btn btn-secondary x-button"; // add the X button
      
      if (index !=0) str += " hidden"; // the X button is selected for the first poll
        
      str +="'><b>X</b></div>"
          + "<div class='btn btn-success plus-button"; // ad the PLUS button
      
      if (index !=0) str += " hidden"; // the PLUS button is selected for the first poll
          
      str +="'><b>+</b></div>"
          + "<form action='/newoption' method='post' class='new-option-form hidden input-group'>" // add the new-option form
          + "<input type='text' name='option' placeholder='new option' class='form-control' max-length='100' required>" // insert a new option
          + "<input type='hidden' name='id' value='" + value._id +"'>" // send the poll id along with the request
          + "<span class='input-group-btn'><button type='submit' class='btn btn-success'>Add</button></span>"
          + "</form>"
          + "</div>";
      
      $(".poll-list").append(str);

      
    })
    
    // activate new option
    $('.plus-button').on("click", function(event){
      
      // hide this button
      $(".plus-button").addClass("hidden");
      // add the delete button
      $(".x-button").addClass("hidden");
      // display the form
      $(this).parent().children(".new-option-form").removeClass("hidden");
      $(this).parent().children(".bar-title").addClass("hidden");
      $('.form-control').focus();
      // prevent event propagation
      event.stopPropagation();
      
    })
    
    // new option form
    $('.new-option-form').on("click", function(event){
      event.stopPropagation();
    })
    
    // activate delete
    $('.x-button').on("click", function(event){
      
      // hide this button
      $(".x-button").addClass("hidden");
      // hide the button that adds a new option
      $(".plus-button").addClass("hidden");
      // display the remove button
      $(this).parent().children(".delete-button").removeClass("hidden");
      
      // prevent parent from activating
      event.stopPropagation();
    })
    
    // confirm delete
    $('.delete-button').on("click", function(event){
      var id = $(this).parent().attr('id');
      console.log(id);
      event.stopPropagation();
      $.post("/delete?" + $.param({id: id}), function(){
        console.log('deleted');
        location.reload(true);
      })
    })
    
    // the newst graph will be displayed when the page is opened
    if (polls.length > 0){
      
      // set the title
      $(".graph-title").html(polls[0].title);
      
      // display the graph
      displayPoll(polls[0], ".chart");
      
    }
    
    // click on poll to show its graph
    $(".poll").on("click", function(){
      console.log("you clicked the poll")
      // hide previous selection
      $(".poll").removeClass("on-display");
      $(".new-poll").addClass("hidden");
      $(".chart").removeClass("chart-style");
      $(".x-button").addClass("hidden");
      $(".plus-button").addClass("hidden");
      $(".delete-button").addClass("hidden");
      $(".new-option-form").addClass("hidden");
      
      // display all titles
      $(".bar-title").removeClass("hidden");
      
      // display current selection
      $(this).addClass("on-display");
      $(this).children(".x-button").removeClass("hidden");
      $(this).children(".plus-button").removeClass("hidden");
      
      // empty the graph
      $('.chart').html('');
      
      if ($(this).attr('id') != "poll-form"){
        
        $(".chart").addClass("chart-style");
         
        // select the correct one to show, and show it
        for (var i = 0; i < allPolls.length; i ++){
        
          if (allPolls[i]._id == $(this).attr("id")){
          
            var tmp = allPolls[i];
          
            $(".graph-title").html(tmp.title);
          
            displayPoll(allPolls[i], '.chart');
          }
        }
      } else {       
        // display the form
        $(".graph-title").html("Create a new poll!");
        $(".new-poll").removeClass("hidden");
        $(".new-title").focus();
      }
    })
    
    
  })
  

    
  // ADD EXTRA OPTION TO NEW POLL
  $(".new-option").on("click", function(){
    
    console.log("adding stuff")
    $(".new-poll").append('<input name="option" maxlength="100" placeholder="more options" class="form-control" type="text">')
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
  var y = d3.scaleLinear().range([height - paddingVertical, paddingVertical]).domain([0, maxY + 1]);
  
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

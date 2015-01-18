$(document).ready(function() {//var viewportWidth = $(window).width();
  //var viewportHeight = $(window).height();

  var svg = d3.select("body")
  .append("svg")
  .attr("width", 5500)
  .attr("height", 3800);

  var group = svg.append("g")
    .attr("id","viewport");

  var rectangleRadius = 5;





  d3.json('/nyc',function(data) {

    var drag = d3.behavior.drag()
    .origin(Object)
    .on("drag", dragmove)
    .on("dragend",function(d){
      var translation = d3.select(this).attr("transform").split('(')[1].split(')')[0].split(',');
      console.log(translation);
     
       d.x = translation[0];
       d.y = translation[1];
      
      $.ajax({
        url: '/box', 
        type: 'POST', 
        contentType: 'application/json', 
        data: JSON.stringify(d)
      })

    });

    function dragmove(d) {
      console.log(this);
      var x = d3.event.x;
      var y = d3.event.y;
      d3.select(this).attr("transform",function(d){ return "translate(" + x + "," + y + ")";});
    }

    var boxes = group.selectAll("g")
    .data(data)
    .enter()
    .append('g')
    .attr("transform",function(d){ return "translate(" + d.x + "," + d.y + ")";})
    .call(drag);


   
    
    boxes.append("text")
      .text(function(d){
        return d.title;
      })
      .attr("x",65)
      .attr("y",20);

    boxes.append("text")
      .text(function(d){
        return d.name;
      })
      .attr("class","name")
      .attr("x",65)
      .attr("y",40);


    // boxes.append("pattern")
    //  .attr("id", function(d){ return d.title })
    //  .append("image")
    //  .attr("xlink:href", "img/deblasio.jpg");
    boxes.append("clipPath")
      .attr("id","clipRect")
      .append("rect")
      .attr("width",60)
      .attr("height",60)
      .attr("rx",5)
      .attr("ry",5);


    boxes.append("image")
      .attr("xlink:href", "img/deblasioThumb.jpg")
      .attr("height",60)
      .attr("width",60)
      .attr("clip-path", "url(#clipRect)");

    //draw outer box last
    boxes.append("rect")
      .attr("width",function(d){ return 200; })
      .attr("height",function(d){ return 60; })
      .attr("rx",rectangleRadius)
      .attr("ry",rectangleRadius);

    $('#saveButton').click(function(){
      var json = JSON.stringify(data);
      console.log(json);
    });

  });

  $('svg').svgPan('viewport');
});

$(document).ready(function() {

  var svg = d3.select("body")
  .append("svg")
  .attr("width", 5500)
  .attr("height", 3800);

  var group = svg.append("g")
    .attr("id","viewport");

  var rectangleRadius = 5;





  d3.json('/nyc/api/boxes',function(data) {

    var drag = d3.behavior.drag()
    .origin(Object)
    .on("drag", dragmove)
    .on("dragend",function(d){
      var translation = d3.select(this).attr("transform").split('(')[1].split(')')[0].split(',');
     
      if (d.x != parseInt(translation[0])) {
         d.x = translation[0];
         d.y = translation[1];
        
        $.ajax({
          url: '/nyc/api/boxes/' + d._id, 
          type: 'POST', 
          contentType: 'application/json', 
          data: JSON.stringify(d)
        })
      }

    });

    function dragmove(d) {
      //console.log(this);
      var x = d3.event.x;
      var y = d3.event.y;
      d3.select(this).attr("transform",function(d){ return "translate(" + x + "," + y + ")";});
    }


    function updateBoxes() {
      var boxes = group.selectAll("g")
      .data(data)
      .enter()
      .append('g')
      .attr("transform",function(d){ return "translate(" + d.x + "," + d.y + ")";})
      .attr("class","box")
      .on("click",function(d){
        
        console.log("click");
        var scope = angular.element(document.getElementById("form")).scope();
        scope.$apply(function () {
          scope.box = d;
        });

      })
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

      boxes.append("clipPath")
        .attr("id","clipRect")
        .append("rect")
        .attr("width",60)
        .attr("height",60)
        .attr("rx",5)
        .attr("ry",5);

      boxes.append("image")
        .attr("xlink:href", function(d){
          return "img/" + d.thumbnail;
        })
        .attr("height",60)
        .attr("width",60)
        .attr("clip-path", "url(#clipRect)");

      //draw outer box last
      boxes.append("rect")
        .attr("width",function(d){ return 300; })
        .attr("height",function(d){ return 60; })
        .attr("rx",rectangleRadius)
        .attr("ry",rectangleRadius);
    }
    updateBoxes();

    $('#newButton').click(function(){
      var emptyBox = {
          "x" : 10,
          "y" : 10,
          "title" : "Title",
          "name" : "Name",
          "thumbnail" : "noimagethumb.png"
      }

      data.push(emptyBox);
      updateBoxes();
    });

  });
  



  //$('svg').svgPan('viewport');
});

function boxController($scope) {
  $scope.name = "hello";

  $scope.update = function() {
    console.log("update");
    if($scope.box._id){ //if the box exists, update
      console.log("there's already an id");
    } else { //if it's new, create
      console.log($scope.box);
      $.ajax({
          url: '/nyc/api/boxes', 
          type: 'POST', 
          contentType: 'application/json', 
          data: JSON.stringify($scope.box)
        })
    }
  };

  $scope.delete = function() {
    $.ajax({
      url: '/nyc/api/boxes/' + $scope.box._id, 
      type: 'DELETE', 
      contentType: 'application/json', 
      //data: JSON.stringify($scope.box)
    })
  };


}

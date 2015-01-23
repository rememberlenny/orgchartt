$(document).ready(function() {

  var svg = d3.select("body")
  .append("svg")
  .attr("width", 5500)
  .attr("height", 3800)
  .call(function() {
    var bgDrag = d3.behavior.drag()
    .on("drag", function() {
      console.log('drag');
    })
  });

  var group = svg.append("g")
    .attr("id","viewport");

  var rectangleRadius = 5;





  d3.json('/nyc/api/boxes',function(data) {

    var drag = d3.behavior.drag()
    .origin(Object)
    .on("drag", dragmove)
    .on("dragend",function(d){
      console.log("dragend");
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
      console.log("dragmove");
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

      boxes.append("rect") //Outer rect for agency
        .attr("width",function(d){ return 300; })
        .attr("height",function(d){ return 95; })
        .attr("y",-35)
        .attr("rx",rectangleRadius)
        .attr("ry",rectangleRadius)
        .attr("style", function(d){
          if(d.chiefOf) {
            return 'stroke-width:3';
          } else {
            return 'stroke-width:0';
          }
        });

      boxes.append("text")
        .text(function(d){
          return d.chiefOf;
        })
        .attr("class","title")
        .attr("x",10)
        .attr("y",-11);
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
  


  var enablePan = true;
  var enableDrag = true;
  $('svg').svgPan('viewport', enablePan, enableDrag);
});

function boxController($scope) {
  $scope.name = "hello";

  $scope.update = function() {
    console.log("update");
    if($scope.box._id){ //if the box exists, update
      console.log("there's already an id");
      $.ajax({
          url: '/nyc/api/boxes/' + $scope.box._id, 
          type: 'POST', 
          contentType: 'application/json', 
          data: JSON.stringify($scope.box)
        })
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

$('#imageButton').click(function(){
  $('#imagePop').show();
});


//cropbox.js 
var options =
        {
            thumbBox: '.thumbBox',
            spinner: '.spinner',
            imgSrc: ''
        }
        var cropper = $('.imageBox').cropbox(options);
        $('#file').on('change', function(){
            var reader = new FileReader();
            reader.onload = function(e) {
                options.imgSrc = e.target.result;
                cropper = $('.imageBox').cropbox(options);
            }
            reader.readAsDataURL(this.files[0]);
            this.files = [];
        })
        $('#btnCrop').on('click', function(){
            var img = cropper.getDataURL();

            $.ajax({
              type: "POST",
              url: "/nyc/api/images",
              data: {img: encodeURIComponent(img)},
              contentType: "application/x-www-form-urlencoded;charset=UTF-8",
              success: function(res){
                  $('#imagePop').hide();
                  //$('#thumbnailInput').val(res.name);
                  
                  var scope = angular.element($('#form')).scope();
                  scope.$apply(function(){
                    scope.box.thumbnail = res.name;
                  });
              }
            });
            // '/data:image\/.*;base64,/'

            $('.cropped').append('<img src="'+img+'">');
        })
        $('#btnZoomIn').on('click', function(){
            cropper.zoomIn();
        })
        $('#btnZoomOut').on('click', function(){
            cropper.zoomOut();
        })


}

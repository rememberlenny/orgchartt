var editMode = false,
  viewData,
  boxData,
  updateBoxes,
  lineToolActive = false,
  enablePan,
  enableDrag;

var lineFunction = d3.svg.line() //function used for drawing lines
                  .x(function(d) { return d.x; })
                  .y(function(d) { return d.y; })
                  .interpolate("linear");



function updateMatrix() { //store the latest viewport transform after drag or zoom
  var lastTransform = $('#viewport').attr('transform');
  viewData.translation = lastTransform;
  console.log(viewData);
}

$(document).ready(function() {

  $.getJSON('nyc/api/view',function(res){ //get the stored view settings
  
  viewData = res;

  var svg = d3.select(".container-fluid")  //create svg
    .append("svg")
    .attr("width", '100%')
    .attr("height", '100%')
    .on('mousedown', mousedown);
  
  function mousedown() {  //All of this live line drawing stuff is from: http://stackoverflow.com/questions/18273884/live-drawing-of-a-line-in-d3-js
    console.log("mousedown");
    m = d3.mouse(this);
    console.log(m);
    line = svg.append("line")
      .attr("x1", m[0])
      .attr("y1", m[1])
      .attr("x2", m[0])
      .attr("y2", m[1])
      .attr({'stroke': 'purple', 'stroke-width': 5, 'fill': 'none'})
      //.call(drag);
    svg.on("mousemove", mousemove)
      .on("mouseup", mouseup);
  }

  function mousemove() {
    console.log("mousemove");
    var m = d3.mouse(this);
    line.attr("x2", m[0])
        .attr("y2", m[1]);
  }

  function mouseup() {
    svg.on("mousemove", null);
  }

  var group = svg.append("g") //append g
    .attr("id", "viewport")
    .attr("transform",viewData.translation);

  var rectangleRadius = 5;


  d3.json('/nyc/api/boxes', function(data) {

      boxData=data;

      var drag = d3.behavior.drag()
        .origin(Object)
        .on("drag", dragmove)
        .on("dragend", function(d) {
     
          //get the translation post-drag  
          var translation = d3.select(this).attr("transform").split('(')[
            1].split(')')[0].split(',');

          //let's add some snap-to logic here
          //25 pixel grid - calculate the nearest multiple of 25 on x and y  and animate the box to it
          console.log(translation);
          //var next = Math.ceil(n/12) * 12;

          translation[0] = (Math.round(translation[0]/25) * 25);
          translation[1] = (Math.round(translation[1]/25) * 25);

          d3.select(this)
            .transition()
              .duration(100)
              .attr("transform","translate(" + translation[0] + "," + translation[1] + ")");

          //if the box has moved, update the associated data
          if (d.x != parseInt(translation[0])) {
            d.x = translation[0];
            d.y = translation[1];

            //POST the changes to the server
            $.ajax({
              url: '/nyc/api/boxes/' + d._id,
              type: 'POST',
              contentType: 'application/json',
              data: JSON.stringify(d)
            })
          }

        });
      

    function dragmove(d) {
      if (editMode) {
        var x = d3.event.x;
        var y = d3.event.y;
        d3.select(this).attr("transform", function(d) {
          return "translate(" + x + "," + y + ")";
        });
      }
    }

    updateBoxes = function(){  //draw boxes from data
      group.selectAll("g").remove();

      console.log("updateBoxes()")
      var boxes = group.selectAll("g")
        .data(boxData)
        .enter()
        .append('g')
        .attr("transform", function(d) {
          return "translate(" + d.x + "," + d.y + ")";
        })
        .attr("class", "box")
        .on("click", function(d) { //send underlying box data to angular

          var scope = angular.element(document.getElementById(
            "form")).scope();
          scope.$apply(function() {
            scope.box = d;
          });

        })
        .call(drag);

      boxes.append("text")
        .text(function(d) {
          return d.title;
        })
        .attr("x", 65)
        .attr("y", 20);

      boxes.append("text")
        .text(function(d) {
          return d.name;
        })
        .attr("class", "name")
        .attr("x", 65)
        .attr("y", 40);

      boxes.append("clipPath")
        .attr("id", "clipRect")
        .append("rect")
        .attr("width", 60)
        .attr("height", 60)
        .attr("rx", 5)
        .attr("ry", 5);

      boxes.append("image")
        .attr("xlink:href", function(d) {
          return "img/" + d.thumbnail;
        })
        .attr("height", 60)
        .attr("width", 60)
        .attr("clip-path", "url(#clipRect)");

      //draw outer box last
      boxes.append("rect")
        .attr("width", function(d) {
          return 250;
        })
        .attr("height", function(d) {
          return 60;
        })
        .attr("rx", rectangleRadius)
        .attr("ry", rectangleRadius);

      boxes.append("rect") //Outer rect for agency
        .attr("width", function(d) {
          return 250;
        })
        .attr("height", function(d) {
          return 95;
        })
        .attr("y", -35)
        .attr("rx", rectangleRadius)
        .attr("ry", rectangleRadius)
        .attr("style", function(d) {
          if (d.chiefOf) {
            return 'stroke-width:3';
          } else {
            return 'stroke-width:0';
          }
        });

      boxes.append("text")
        .text(function(d) {
          return d.chiefOf;
        })
        .attr("class", "title")
        .attr("x", 10)
        .attr("y", -11);
    }
    updateBoxes();
  });

  //jquery-svgpan thanks to John Krauss
  enablePan = true;
  enableDrag = true;
  $('svg').svgPan('viewport', enablePan, enableDrag);
       
  })
});

//Load angular controllers outside of document.ready();

var viewController = function($scope) {
  $scope.editMode = false;
  $scope.lineToolActive = false;

  //set global editMode based on angular editMode
  $scope.$watch('editMode', function() {
    $scope.editMode ? editMode = true : editMode = false;
    console.log(editMode);
  });

  //set global lineToolActive based on angular lineToolActive
  $scope.$watch('lineToolActive', function() {
    $scope.lineToolActive ? lineToolActive = true : lineToolActive = false;
    $scope.lineToolActive ? enablePan = false : enablePan = true;
    $('svg').svgPan('viewport', enablePan, enableDrag);
    console.log(lineToolActive);
  });

  $scope.newBox = function(){
    console.log("NewBox!");
    var emptyBox = {
        "x": 10,
        "y": 10,
        "title": "Title",
        "name": "Name",
        "thumbnail": "noimagethumb.png"
      }

      boxData.push(emptyBox);
      updateBoxes();
  };


}

var boxController = function($scope) {
  $scope.name = "hello";

  $scope.update = function() {
    console.log("update");
    if ($scope.box._id) { //if the box exists, update
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
    updateBoxes();
  };

  $scope.delete = function() {
    $.ajax({
      url: '/nyc/api/boxes/' + $scope.box._id,
      type: 'DELETE',
      contentType: 'application/json',
      //data: JSON.stringify($scope.box)
    })
  };

  //Listeners
  


  $('#imageButton').click(function() {
    $('#imagePop').show();
  });

    //listen for save, push view to server
  $('.saveButton').click(function(){
    console.log(viewData);
    $.ajax({
      url: '/nyc/api/view/',
      type: 'POST',
      contentType: 'application/json',
      data: JSON.stringify(viewData)
    })
  });


  //cropbox.js 
  var options = {
    thumbBox: '.thumbBox',
    spinner: '.spinner',
    imgSrc: ''
  }
  var cropper = $('.imageBox').cropbox(options);
  $('#file').on('change', function() {
    var reader = new FileReader();
    reader.onload = function(e) {
      options.imgSrc = e.target.result;
      cropper = $('.imageBox').cropbox(options);
    }
    reader.readAsDataURL(this.files[0]);
    this.files = [];
  })
  $('#btnCrop').on('click', function() {
    var img = cropper.getDataURL();

    $.ajax({
      type: "POST",
      url: "/nyc/api/images",
      data: {
        img: encodeURIComponent(img)
      },
      contentType: "application/x-www-form-urlencoded;charset=UTF-8",
      success: function(res) {
        $('#imagePop').hide();
        //$('#thumbnailInput').val(res.name);

        var scope = angular.element($('#form')).scope();
        scope.$apply(function() {
          scope.box.thumbnail = res.name;
        });
      }
    });
    // '/data:image\/.*;base64,/'

    $('.cropped').append('<img src="' + img + '">');
  })
  $('#btnZoomIn').on('click', function() {
    cropper.zoomIn();
  })
  $('#btnZoomOut').on('click', function() {
    cropper.zoomOut();
  })
}
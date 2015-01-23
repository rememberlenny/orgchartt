var express = require('express'),
	mongoose = require('mongoose'),
  bodyParser = require('body-parser'),
  fs = require('fs');

var app = express()

mongoose.connect('mongodb://admin:WoofyDog54@ds031571.mongolab.com:31571/heroku_app33449780');


app.use(express.static(__dirname + '/public'));
app.use( bodyParser.json() ); 
app.use(bodyParser.urlencoded({     // to support URL-encoded bodies
  extended: true
})); 
app.use(bodyParser.json());

var server = app.listen(process.env.PORT || 5000, function () {

  var host = server.address().address
  var port = server.address().port

  console.log('Example app listening at http://%s:%s', host, port)

})

//CREATE
app.post('/nyc/api/boxes/',function (req, res) {
  console.log(req.body);
  var thisBox = req.body;
  console.log(thisBox);
  BoxModel.create(thisBox, function(err) {
    if (err) {
        res.status(500).json({});
        return;
    }

    res.status(204).json({});
  });
});

//READ
app.get('/nyc/api/boxes', function (req, res) {
  return BoxModel.find(function (err,boxes) {
    if (!err) {
      return res.send(boxes);
    } else {
      return console.log(err);
    }
  });
})


//UPDATE
app.post('/nyc/api/boxes/:id',function (req, res) {
  console.log(req.body);
  var thisBox = req.body;
  BoxModel.update({_id: thisBox._id}, thisBox, function(err) {
    if (err) {
        res.status(500).json({});
        return;
    }

    res.status(204).json({});
  });
});

//DELETE
app.delete('/nyc/api/boxes/:id',function (req, res) {
  
  BoxModel.remove({_id: req.params.id}, function(err) {
    if (err) {
        res.status(500).json({});
        return;
    }

    res.status(204).json({});
  });
})

//create image
app.post('/nyc/api/images',function (req, res) {
  var image = decodeURIComponent(req.body.img);
  var imageBuffer = decodeBase64Image(image);
  var timestamp = new Date().getTime().toString();
  fs.writeFile('public/img/' + timestamp + '.png', imageBuffer.data, function(err) {
    res.status(201).json({'name':timestamp + '.png'})
  });
});

var Schema = mongoose.Schema;  

var Box = new Schema({  
    title: { type: String, required: true }, 
    name: { type: String, required: true },
    thumbnail: { type: String, required: true },
    x: { type: Number, required: true},
    y: { type: Number, required: true},
    chiefOf: { type: String, required: false }
});

var BoxModel = mongoose.model('Box', Box); 

//image POST processing from http://stackoverflow.com/questions/20267939/nodejs-write-base64-image-file
function decodeBase64Image(dataString) {
  var matches = dataString.match(/^data:([A-Za-z-+\/]+);base64,(.+)$/),
    response = {};

  if (matches.length !== 3) {
    return new Error('Invalid input string');
  }

  response.type = matches[1];
  response.data = new Buffer(matches[2], 'base64');

  return response;
}

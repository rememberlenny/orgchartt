var express = require('express'),
	mongoose = require('mongoose'),
  bodyParser = require('body-parser');

var app = express()

mongoose.connect('mongodb://localhost/orgChart');


app.use(express.static(__dirname + '/public'));
app.use( bodyParser.json() ); 
app.use(bodyParser.urlencoded({     // to support URL-encoded bodies
  extended: true
})); 
app.use(bodyParser.json());

var server = app.listen(4000, function () {

  var host = server.address().address
  var port = server.address().port

  console.log('Example app listening at http://%s:%s', host, port)

})

app.get('/nyc', function (req, res) {
  return BoxModel.find(function (err,boxes) {
    if (!err) {
      return res.send(boxes);
    } else {
      return console.log(err);
    }
  });
})

app.post('/box',function (req, res) {
  console.log(req.body);
  var thisBox = req.body;
  BoxModel.update({_id: thisBox._id}, thisBox, {upsert: true}, function(err) {
    if (err) {
        res.status(500).json({});
        return;
    }

    res.status(204).json({});
  });
});

var Schema = mongoose.Schema;  

var Box = new Schema({  
    title: { type: String, required: true }, 
    x: { type: Number, required: true},
    y: { type: Number, required: true}
});

var BoxModel = mongoose.model('Box', Box); 


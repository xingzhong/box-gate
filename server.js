var express = require('express')
	, app = express()
  	, server = require('http').createServer(app)
  	, io = require('socket.io').listen(server);
  
app.use(express.static(__dirname + "/static"))

var mongoose = require('mongoose');
mongoose.connect('localhost', 'test');
var schema = mongoose.Schema({ timeIn: Date, timeOut: Date });
var Time = mongoose.model('Time', schema);

server.listen(8000);

app.get('/', function (req, res) {
  res.sendfile(__dirname + '/index.html');
});

io.sockets.on('connection', function (socket) {
  socket.on('log', function (data) {
	time = new Time({
		timeIn: data.timeIn,
		timeOut: new Date().getTime()
	});
	time.save(function (err) {
	  if (!err) 
	  	console.log('save');
	});

	
  });
  socket.on('listready', function (data) {
      Time.find()
  		.sort({timeIn: -1})
  		.limit(20)
  		.exec(function(err, times) {
      	if (!err) {
      		socket.emit('list', times);
     	}});
  });
});




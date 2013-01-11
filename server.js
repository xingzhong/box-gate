var express = require('express')
	   , app = express()
  	 , server = require('http').createServer(app)
  	 , io = require('socket.io').listen(server);
  
app.use(express.static(__dirname + "/static"))

var mongoose = require('mongoose');
mongoose.connect('localhost', 'test');
var schema = mongoose.Schema({ 
  timeIn: Date,
  uid: Number,
  did: Number });
var Record = mongoose.model('Record', schema);

server.listen(8080);

app.get('/', function (req, res) {
  res.sendfile(__dirname + '/index.html');
});

io.sockets.on('connection', function (socket) {
  
  socket.on('log', function (data) {
  	var record = new Record({
    		timeIn: data.timeIn,
    		uid: data.uid,
        did: data.did,
    	});
  	record.save(function (err) {
  	  if (!err) 
  	  	console.log('save');
  	});
  });

  socket.on("delRec", function(id){
    console.log(id);
    Record.findByIdAndRemove(id).exec();
  });

  socket.on('listready', function (data) {
      Record.find()
  		.sort({timeIn: -1})
  		.limit(20)
  		.exec(function(err, records) {
      	if (!err) {
      		socket.emit('list', records);
     	}});
  });
});




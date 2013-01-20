var twitter = require('ntwitter');
//var express = require("express");
//var app = express.createServer(express.logger());
var app = require("http").createServer(handler);
var io = require('socket.io').listen(app);

function handler (req, res) {
  fs.readFile(__dirname + '/index.html',
  function (err, data) {
    if (err) {
      res.writeHead(500);
      return res.end('Error loading index.html');
    }

    res.writeHead(200);
    res.end(data);
  });
}

// assuming io is the Socket.IO server object
io.configure(function () { 
  io.set("transports", ["xhr-polling"]); 
  io.set("polling duration", 10); 
});


io.sockets.on('connection', function(socket) {
	console.log("connection on");
	socket.on('keyword', function(key) {
		console.log(key);
		twit.stream('statuses/filter', {'track':key}, function(stream) {
			stream.on('data', function(data) {
				io.sockets.emit('news', data);
			});
		});
	});
});

var twit = new twitter({
	consumer_key: 'verwURhvFVTuojYVJykZQ',
	consumer_secret: 'RQDgjMrlen8QdZJM90rK9zxvCtSlJXfU7I7YO2STELk',
	access_token_key: '26635865-5GyKYJD8oqteN7VvklzWE7Vtsssovorvo90P8izoc',
	access_token_secret: 'kLZebpapNT9bQpCYXSoaJJojIpebukyNrjb8HSmVwA'
});

port = process.env.PORT || 5000;
app.listen(port);
//app.listen(port, function(){
//	console.log("Express server listening on port %d in %s mode", app.address().port, app.settings.env);
//});
//twit.stream ('statuses/sample', function (stream) {
//twit.stream('statuses/filter', {'locations':'-122.75,36.8,-121.75,37.8,-74,40,-73,41'}, function(stream) {

var twitter = require('ntwitter');
var express = require("express");
var app = express();
var server = require('http').createServer(app);
var io = require('socket.io').listen(server);


// assuming io is the Socket.IO server object
io.configure(function () { 
  io.set("transports", ["xhr-polling"]); 
  io.set("polling duration", 10); 
});


io.sockets.on('connection', function(socket) {
	socket.on('disconnect', function() {
		io.sockets.emit('user disconnected');
	});
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

//twit.stream ('statuses/sample', function (stream) {
//twit.stream('statuses/filter', {'locations':'-122.75,36.8,-121.75,37.8,-74,40,-73,41'}, function(stream) {

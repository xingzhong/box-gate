/*
  the interface MongoDB through WebSocket 
*/

var express = require('express')
	   , app = express()
  	 , server = require('http').createServer(app)
  	 , io = require('socket.io').listen(server);
  
app.use(express.static(__dirname + "/static"))

var mongoose = require('mongoose');
mongoose.connect('localhost', 'test');
var schema = mongoose.Schema({ 
  Datetime: Date,
  Depth: Number,
  Eqid: String,
  Lat: Number,
  Lon: Number,
  Magnitude: Number, 
  NST: Number,
  Region: String,
  Src: String,
  Version: String,
});
var Record = mongoose.model('Record', schema);

server.listen(8080);

app.get('/', function (req, res) {
  res.sendfile(__dirname + '/index.html');
});

io.sockets.on('connection', function (socket) {
  
  socket.on('log', function (data) {
    console.log(data);
  	var record = new Record({
    		Datetime: data.Datetime,
    		Depth: data.Depth,
        Eqid: data.Eqid,
        Lat: data.Lat,
        Lon: data.Lon,
        Magnitude: data.Magnitude,
        NST: data.NST,
        Region: data.Region,
        Src: data.Src,
        Version: data.Version,
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

  socket.on("cleanDB", function(){
    Record.find().exec(function(err, records){
      if(!err){
        records.forEach(function(d){
          d.remove();
        })
      }
    });
  });

  socket.on('listready', function (data) {
    sorted = "Datetime";
    if (data) {
      sorted = data;
    }
    console.log("sorted: " + sorted);
      Record.find()
  		  .sort(sorted)
  		  .limit(20)
  		  .exec(function(err, records) {
      	 if (!err) {
      		  socket.emit('list', records);
     	  }});
  });

  socket.on("count", function(data) {
    Record.count({}, function(err, count) {
      if (!err) {
        socket.emit("countReady", count);
      }
    });
  });

  socket.on("mapreduce1", function(data) {
    var o = {};
    o.map = function() { emit(this.Region, 1)};
    o.reduce = function(k, vals) { return vals.length; };
    o.out = {replace : "mapreduce_example1"};
    o.verbose = true;
    Record.mapReduce(o, function(err, model, stats) {
      if (!err) {
        console.log("mapReduce took %d ms", stats.processtime);
        model.find()
          .sort("-value")
          .limit(10)
          .exec(function (err, records) {
            socket.emit("mapreduce1Reday", records);
          });
      }
    });
  });

  socket.on("mapreduce2", function(data) {
    var o = {};
    o.map = function() {
      var date = new Date();
      //date.setTime(this.Datetime.setUTCMinutes(0,0,0));
      date.setTime(this.Datetime.setUTCHours(0,0,0,0));
      emit(date.getTime(), 1);
    };
    o.reduce = function(k, vals) { return vals.length; };
    o.out = {replace : "mapreduce_example2"};
    o.verbose = true;
    Record.mapReduce(o, function(err, model, stats) {
      if (!err) {
        console.log("mapReduce took %d ms", stats.processtime);
        model.find()
          .sort("_id")
          //.limit(20)
          .exec(function (err, records) {
            socket.emit("mapreduce2Reday", records);
          });
      }
    });
  });

});




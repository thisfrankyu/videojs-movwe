var express = require('express');
var app = express();
var http = require('http').Server(app);
var io = require('socket.io')(http);


app.use(express.static(__dirname + '/video-js'));
app.use(express.static(__dirname));
app.get('/', function (request, response) {
	response.sendFile(__dirname + '/index.html');
});

io.on('connection', function(socket){
	socket.broadcast.emit('hi');
	console.log('a user connected');
	socket.on('command', function(msg){
		console.log('emitting command: ' + msg);
		io.emit('command', msg);
	});
	socket.on('pause', function(){
		console.log('emitting pause');
		io.emit('pause');
	});
	socket.on('play', function(){
		console.log('emitting play');
		io.emit('play');
	});
	socket.on('disconnect', function(){
		console.log('user disconnected');
	});

});

http.listen(3000, function(){
	console.log('listening on *:3000');
});
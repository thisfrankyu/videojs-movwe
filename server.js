var express = require('express');
var app = express();
var http = require('http').Server(app);
var io = require('socket.io')(http);
var request = require('request');
var PlexAuthenticator = require('./movwe/plex-authenticator').PlexAuthenticator;
var Movwe = require('./movwe/movwe').Movwe;
var properties = require('./movwe/movwe-properties');


app.use(express.static(__dirname + '/video-js'));
app.use(express.static(__dirname));
app.get('/', function (request, response) {
    response.sendFile(__dirname + '/index.html');
});

var movwe = new Movwe(io, new PlexAuthenticator());
movwe.init();
setInterval(movwe.synchronize.bind(movwe), 1000);

var port = properties.port;
http.listen(port, function () {
    console.log('listening on *:' + port);
});



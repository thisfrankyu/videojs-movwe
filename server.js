var express = require('express');
var app = express();
var http = require('http').Server(app);
var io = require('socket.io')(http);
var properties = require('./movwe/movwe-properties');

var PlexEndpoint = require('./movwe/plex-endpoint').PlexEndpoint;
var Movwe = require('./movwe/movwe').Movwe;

app.use(express.static(__dirname + '/video-js'));
app.use(express.static(__dirname));

app.get('/', function (request, response) {
    response.sendFile(__dirname + '/index.html');
});

var endpoint = new PlexEndpoint(properties.plexHost, properties.plexPort);
var movwe = new Movwe(io, endpoint);

var port = properties.serverPort;
http.listen(port, function () {
    console.log('Listening on port ' + port);
});
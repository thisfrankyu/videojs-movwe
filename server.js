var express = require('express');
var app = express();
var http = require('http').Server(app);
var io = require('socket.io')(http);
var request = require('request');
var requestPromise = require('request-promise');
var parseString = require('xml2js').parseString;

app.use(express.static(__dirname + '/video-js'));
app.use(express.static(__dirname));
app.get('/', function (request, response) {
    response.sendFile(__dirname + '/index.html');
});

function authenticate(username, password) {

    var encodedUsernamePassword = new Buffer(username + ':' + password).toString('base64');
    var options = {
        url: "https://my.plexapp.com/users/sign_in.xml",
        headers: {
            'Authorization': 'Basic ' + encodedUsernamePassword,
            'X-Plex-Client-Identifier': 'movwe'
        },
        resolveWithFullResponse: true
    };

    return requestPromise.post(options).then(function (response) {
        if (response.statusCode === 201) {
            var body = response.body;
            console.log(body);
            var authenticationToken = '';
            parseString(body, function (err, result) {
                console.log(result);
                authenticationToken = result.user['authentication-token'];
                console.log('authentication token: ' + authenticationToken);
                return authenticationToken;
            });
            return authenticationToken;
        } else{
            console.log('Error in authentication: ' + error);
            console.log('statusCode: ' + response.statusCode);
            console.log('error body: ' + body);
            return 'ERROR';
        }
    }, function(error) {
        console.log('Error in authentication: ' + error);
    }).then(function (token) {
        console.log('returned authToken: ' + token);
        return token;
    });
}

io.on('connection', function (socket) {
    socket.broadcast.emit('hi');
    console.log('a user connected');
    socket.on('command', function (msg) {
        console.log('emitting command: ' + msg);
        io.emit('command', msg);
    });
    socket.on('pause', function () {
        console.log('emitting pause');
        io.emit('pause');
    });
    socket.on('play', function () {
        console.log('emitting play');
        io.emit('play');
    });
    socket.on('disconnect', function () {
        console.log('user disconnected');
    });
    authenticate('blah@blah.com', 'blah').then(function (token) {
        io.emit('token', token);
        console.log('token emitted: ' + token);
        socket.on('authenticate', function () {
            io.emit('token', token);
            console.log('token emitted: ' + token);
        });
    });

});

var port = 3000;
http.listen(port, function () {
    console.log('listening on *:'+port);
});



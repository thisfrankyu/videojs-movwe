var express = require('express');
var app = express();
var http = require('http').Server(app);
var io = require('socket.io')(http);
var request = require('request');
var parseString = require('xml2js').parseString;

app.use(express.static(__dirname + '/video-js'));
app.use(express.static(__dirname));
app.get('/', function (request, response) {
    response.sendFile(__dirname + '/index.html');
});

function authenticate(username, password) {
    function callback(error, response, body) {
        if (!error && response.statusCode === 201) {
            console.log(body);
            parseString(body, function (err, result){
                console.log(result);
                console.log("authentication token: " + result.user['authentication-token']);
            });
        } else{
            console.log("Error in authentication: " + error);
            console.log('statusCode: ' + response.statusCode);
            console.log('error body: ' + body);
        }
    }

    var encodedUsernamePassword = new Buffer(username + ':' + password).toString('base64');
    var options = {
        url: "https://my.plexapp.com/users/sign_in.xml",
        headers: {
            'Authorization': 'Basic ' + encodedUsernamePassword,
            'X-Plex-Client-Identifier': 'movwe'
        }
    };
    request.post(options, callback);
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

});

http.listen(3000, function () {
    console.log('listening on *:3000');
});

authenticate('blah@blah.com', 'blah');
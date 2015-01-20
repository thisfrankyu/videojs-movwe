var express = require('express');
var app = express();
var http = require('http').Server(app);
var io = require('socket.io')(http);
var request = require('request');
var requestPromise = require('request-promise');
var parseString = require('xml2js').parseString;
var _ = require('underscore');

app.use(express.static(__dirname + '/video-js'));
app.use(express.static(__dirname));
app.get('/', function (request, response) {
    response.sendFile(__dirname + '/index.html');
});

var sessionMap = {};


function synchronize() {
    var lowestTimeSoFar = Number.POSITIVE_INFINITY;
    var acceptableDelay = 3;
    var goAheadTime = 1;
    //console.log('sessionMap: ' + sessionMap);
    _.each(sessionMap, function (session) {
        lowestTimeSoFar = Math.min(session.currentTime, lowestTimeSoFar);
    });
    _.each(sessionMap, function (session) {
        var tooFarAhead = session.currentTime > lowestTimeSoFar + acceptableDelay;
        if (tooFarAhead && !session.pausedForSynchronization) {
            session.socket.emit('pause');
            session.pausedForSynchronization = true;
            console.log('pausing ' + session.id + ' (ahead by ' + (session.currentTime - lowestTimeSoFar) + ')');
        }
        var closeEnoughToStartAgain = session.currentTime < lowestTimeSoFar + goAheadTime;
        if (session.pausedForSynchronization && closeEnoughToStartAgain) {
            session.socket.emit('play');
            session.pausedForSynchronization = false;
            console.log('resuming ' + session.id);
        }
    });
}

function authenticate(username, password) {

    var encodedUsernamePassword = new Buffer(username + ':' + password).toString('base64');
    var options = {
        url: "https://my.plexapp.com/users/sign_in.xml",
        headers: {
            'Authorization': 'Basic ' + encodedUsernamePassword,
            'X-Plex-Client-Identifier': 'MovWe'
        },
        resolveWithFullResponse: true
    };

    return requestPromise.post(options).then(function (response) {
        if (response.statusCode === 201) {
            var body = response.body;
            //console.log(body);
            var authenticationToken = '';
            parseString(body, function (err, result) {
                //console.log(result);
                authenticationToken = result.user['authentication-token'];
                console.log('got token: ' + authenticationToken);
                return authenticationToken;
            });
            return authenticationToken;
        } else {
            console.log('Error in authentication: ' + error);
            console.log('statusCode: ' + response.statusCode);
            console.log('error body: ' + response.body);
            return 'ERROR';
        }
    }, function (error) {
        console.log('Error in authentication: ' + error);
    }).then(function (token) {
        //console.log('returning token: ' + token);
        return token;
    });
}

io.on('connection', function (sessionSocket) {
    sessionMap[sessionSocket.id] = {
        socket: sessionSocket,
        id: sessionSocket.id,
        currentTime: 0,
        timestamp: Date.now(),
        pausedForSynchronization: false
    };
    sessionSocket.emit('hi', sessionSocket.id);
    console.log('a user connected: session.id: ' + sessionSocket.id + ' rest of socket: ' + sessionSocket.toString());
    sessionSocket.on('command', function (msg) {
        console.log('emitting command: ' + msg);
        io.emit('command', msg);
    });
    sessionSocket.on('pause', function () {
        console.log('emitting pause');
        io.emit('pause');
    });
    sessionSocket.on('play', function () {
        console.log('emitting play');
        io.emit('play');
        _.each(sessionMap, function (session) {
            session.pausedForSynchronization = false;
        });
    });
    sessionSocket.on('time', function (time) {
        //console.log('client: ' + sessionSocket.id + ' is at time: ' + time);
        sessionMap[sessionSocket.id].currentTime = time;
        sessionMap[sessionSocket.id].timestamp = Date.now();
    });
    sessionSocket.on('disconnect', function () {
        console.log('user disconnected');
        delete sessionMap[sessionSocket.id];
    });
    sessionSocket.on('auth', function (data, ret) {
        console.log('received auth request from ' + sessionSocket.id);
        authenticate('blah', 'blah').then(function (token) {
            console.log('returning token "' + token + '" to ' + sessionSocket.id);
            ret(token);
        });
    });

});

setInterval(synchronize, 1000);

var port = 3000;
http.listen(port, function () {
    console.log('listening on *:' + port);
});



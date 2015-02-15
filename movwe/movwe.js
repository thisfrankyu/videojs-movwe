/**
 * Created by frank on 2/1/15.
 */
var express = require('express');
var app = express();
var http = require('http').Server(app);
var io = require('socket.io')(http);
var request = require('request');
var requestPromise = require('request-promise');
var parseString = require('xml2js').parseString;
var _ = require('underscore');

var movweProperties = require('./movwe_properties');

function Movwe(authenticator) {
    this.sessionMap = {};
    this.authenticator = authenticator;
}

Movwe.prototype.registerSocket = function (sessionSocket) {
    this.sessionMap[sessionSocket.id] = {
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
        _.each(this.sessionMap, function (session) {
            session.pausedForSynchronization = false;
        });
    });
    sessionSocket.on('time', function (time) {
        //console.log('client: ' + sessionSocket.id + ' is at time: ' + time);
        this.sessionMap[sessionSocket.id].currentTime = time;
        this.sessionMap[sessionSocket.id].timestamp = Date.now();
    });
    sessionSocket.on('disconnect', function () {
        console.log('user disconnected');
        delete this.sessionMap[sessionSocket.id];
    });
    sessionSocket.on('auth', function (data, ret) {
        console.log('received auth request from ' + sessionSocket.id);
        var username = movweProperties['plexServerProperties']['username'];
        var password = movweProperties['plexServerProperties']['password'];
        this.authenticate(username, password).then(function (token) {
            console.log('returning token "' + token + '" to ' + sessionSocket.id);
            ret(token);
        });
    });
};

Movwe.prototype.authenticate = function (username, password) {

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
};

Movwe.prototype.synchronize = function() {
    var lowestTimeSoFar = Number.POSITIVE_INFINITY;
    var acceptableDelay = 3;
    var goAheadTime = 1;
    //console.log('sessionMap: ' + sessionMap);
    _.each(this.sessionMap, function (session) {
        lowestTimeSoFar = Math.min(session.currentTime, lowestTimeSoFar);
    });
    _.each(this.sessionMap, function (session) {
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
};

module.exports = Movwe;
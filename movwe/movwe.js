/**
 * Created by frank on 2/1/15.
 */
var express = require('express');
var app = express();
var http = require('http').Server(app);
var request = require('request');
var requestPromise = require('request-promise');
var parseString = require('xml2js').parseString;
var _ = require('underscore');
var PlexEndpoint = require('./plex-endpoint').PlexEndpoint;

var movweProperties = require('./movwe-properties');

function Movwe(io, authenticator) {
    this.sessionMap = {};
    this.authenticator = authenticator;
    this.io = io;
}

Movwe.prototype.init = function () {
    this.io.on('connection', this.registerSocket.bind(this));
};

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
    sessionSocket.on('auth', this.handleAuth.bind(this, sessionSocket.id));
    sessionSocket.on('pause', this.handlePause.bind(this));
    sessionSocket.on('play', this.handlePlay.bind(this));
    sessionSocket.on('time', this.handleTime.bind(this, sessionSocket.id));
    sessionSocket.on('disconnect', this.handleDisconnect.bind(this, sessionSocket.id));
};

Movwe.prototype.handlePlay = function () {
    console.log('emitting play');
    this.io.emit('play');
    _.each(this.sessionMap, function (session) {
        session.pausedForSynchronization = false;
    });
};

Movwe.prototype.handlePause = function () {
    console.log('received pause, emitting pause');
    this.io.emit('pause');
};

Movwe.prototype.handleTime = function (sessionSocketId, time) {
    this.sessionMap[sessionSocketId].currentTime = time;
    this.sessionMap[sessionSocketId].timestamp = Date.now();
};

Movwe.prototype.handleAuth = function (sessionSocketId, data, ret) {
    console.log('received auth request from ' + sessionSocketId);
    var username = movweProperties['plexServerProperties']['username'];
    var password = movweProperties['plexServerProperties']['password'];
    this.authenticator.authenticate(username, password).then(function (token) {
        console.log('returning token "' + token + '" to ' + sessionSocketId);
        var plexEndpoint = new PlexEndpoint();
        console.log(plexEndpoint.getLibrary(token));
        ret(token);
    });
};

Movwe.prototype.handleDisconnect = function (sessionSocketId) {
    delete this.sessionMap[sessionSocketId];
};

Movwe.prototype.synchronize = function () {
    var lowestTimeSoFar = Number.POSITIVE_INFINITY;
    var lowestSessionSoFar = 'no one';
    var acceptableDelay = 3;
    var goAheadTime = 1;
    _.each(this.sessionMap, function (session) {
        if (session.currentTime < lowestTimeSoFar) {
            lowestTimeSoFar = session.currentTime;
            lowestSessionSoFar = session.id;
        }
    });
    _.each(this.sessionMap, function (session) {
        var tooFarAhead = session.currentTime > lowestTimeSoFar + acceptableDelay;
        if (tooFarAhead && !session.pausedForSynchronization) {
            session.socket.emit('pause');
            session.pausedForSynchronization = true;
            console.log('pausing ' + session.id + ' (ahead of ' + lowestSessionSoFar + ' by ' + (session.currentTime - lowestTimeSoFar) + ')');
        }
        var closeEnoughToStartAgain = session.currentTime < lowestTimeSoFar + goAheadTime;
        if (session.pausedForSynchronization && closeEnoughToStartAgain) {
            session.socket.emit('play');
            session.pausedForSynchronization = false;
            console.log('resuming ' + session.id);
        }
    });
};

exports.Movwe = Movwe;
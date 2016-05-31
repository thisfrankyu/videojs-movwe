var express = require('express');
var _ = require('underscore');
var app = express();
var http = require('http').Server(app);

class Movwe {
    constructor(io, plexEndpoint) {
        this.io = io;
        this.plexEndpoint = plexEndpoint;
        this.sessions = {};
        this.clientLibrary = {}; // client view of library
        this.videos = {}; // ratingKey -> path
        
        this.plexEndpoint.getLibrary((jsonResult) => {
            this.loadLibrary(jsonResult, this.clientLibrary);
            this.io.on('connection', this.registerSocket.bind(this));
        });
    }

    /**
     * Recursively loads library information from Plex server api into
     * this.clientLibrary, a client-side representation, and
     * this.videos, a key to file path mapping
     */
    loadLibrary(jsonResult, library) {
        if (!_.has(jsonResult, 'MediaContainer')) return;
        if (_.has(jsonResult.MediaContainer, 'Directory')) {
            jsonResult.MediaContainer.Directory.forEach((entry) => {
                var ratingKey = entry.$.ratingKey;
                var title = entry.$.title;
                library[title] = {};
                this.plexEndpoint.getMetadata(ratingKey, (jsonResult) => this.loadLibrary(jsonResult, library[title]));
            });
        }

        if (_.has(jsonResult.MediaContainer, 'Video')) {
            jsonResult.MediaContainer.Video.forEach((entry) => {
                var ratingKey = entry.$.ratingKey;
                var title = entry.$.title;

                entry.Media.forEach((mediaEntry) => {
                    mediaEntry.Part.forEach((part) => this.videos[ratingKey] = part.$.file);
                });

                library[title] = ratingKey;
            });
        }
    }
    
    registerSocket(sessionSocket) {
        this.sessions[sessionSocket.id] = {
            socket: sessionSocket,
            currentTime: 0,
            timestamp: Date.now(),
            pausedForSynchronization: false
        };
        
        console.log('New session created, id=%s' + sessionSocket.id);

        console.log('Client library:' + JSON.stringify(this.clientLibrary, null, '\t'));
        console.log('Videos: ' + JSON.stringify(this.videos, null, '\t'));

        sessionSocket.on('library', () => sessionSocket.emit('libraryResults', this.clientLibrary));
    }
}

/*
function Movwe(io, endpoint) {
    this.endpoint = endpoint;
    this.sessionMap = {};

    io.on('connection', this.registerSocket.bind(this));
    setInterval(this.synchronize, 1000);
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
};*/

exports.Movwe = Movwe;
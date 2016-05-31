var test = require('tape');
var _ = require('underscore');
var util = require('util');
var EventEmitter = require('events').EventEmitter;
var Authenticator = require('../movwe/authenticator').Authenticator;
var Movwe = require('../movwe/movwe').Movwe;


function Socket() {
    this.id = null;
}
util.inherits(Socket, EventEmitter);

test('test connection', function (t) {
    var io = new Socket(),
        socket = new Socket();

    socket.id = 'testSecket';

    var movwe = new Movwe(io, new Authenticator());
    movwe.init();
    socket.once('hi', function () {
        t.ok(true, 'socket should have emitted hi upon io getting connection');
        t.end();
    });
    io.emit('connection', socket);
});

test('test auth', function (t) {
    var io = new Socket(),
        socket = new Socket();

    socket.id = 'testSecket';

    var movwe = new Movwe(io, new Authenticator());
    movwe.init();
    io.emit('connection', socket);
    socket.emit('auth', {plexurl: 'plexurl'}, function (token) {
        return token.then();
    });
    t.equal(movwe.authenticator.token, 'token', 'make sure authenticator has a token after auth message');
    t.end();
});

test('test pause', function (t) {
    var __ret = setup("testSocket");
    var io = __ret.io;
    var socket = __ret.socket;
    io.once('pause', function () {
        t.ok(true, 'pause should have been emitted from io after received from socket');
        t.end();
    });
    socket.emit('pause');
});

function setup(socketId) {
    var io = new Socket(),
        socket = new Socket();

    socket.id = socketId;

    var movwe = new Movwe(io, new Authenticator());
    movwe.init();
    io.emit('connection', socket);
    socket.emit('auth', {plexurl: 'plexurl'}, function (token) {
        return token.then();
    });
    return {io: io, socket: socket, movwe: movwe};
}
test('test play', function (t) {
    var __ret = setup("testSocket");
    var io = __ret.io;
    var socket = __ret.socket;
    io.once('play', function () {
        t.ok(true, 'play should have been emitted from io after received from socket');
        t.end();
    });
    socket.emit('play');
});

test('test time', function (t) {
    var __ret = setup("testSocket");
    var io = __ret.io;
    var socket = __ret.socket;
    var movwe = __ret.movwe;
    movwe.handleTime(socket.id, 1.00);
    t.equal(movwe.sessionMap[socket.id].currentTime, 1.00, 'make sure time is handled correctly');
    t.end();
});

test('test synchronize', function (t) {
    var __ret = setup('testSocket');
    var io = __ret.io;
    var socket = __ret.socket;
    var movwe = __ret.movwe;
    var otherSocket = new Socket();
    otherSocket.id = 'otherSocket';
    io.emit('connection', otherSocket);
    socket.emit('time', 11);
    otherSocket.emit('time', 1);
    socket.emit('play');
    setTimeout(function () {
            movwe.synchronize();
            t.equal(movwe.sessionMap[socket.id].pausedForSynchronization, true, 'make sure socket is paused for synchronization when up 11-1');
            otherSocket.emit('time', 10.8);
            setTimeout(function () {
                movwe.synchronize();
                t.equal(movwe.sessionMap[socket.id].pausedForSynchronization, false, 'make sure socket can resume when otherSocket gets to 10.8-11');
            }, 100);
        }, 100
    );

    t.end();
});

test('test disconnect', function (t) {
    var __ret = setup('testSocket');
    var io = __ret.io;
    var socket = __ret.socket;
    var movwe = __ret.movwe;
    var otherSocket = new Socket();
    otherSocket.id = 'otherSocket';
    io.emit('connection', otherSocket);
    setTimeout(function(){
        movwe.handleDisconnect(otherSocket.id);
        t.equal(movwe.sessionMap[otherSocket.id], undefined, 'make sure disconnected socket is undefined');
    }, 50);
    t.end();
});
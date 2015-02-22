/**
 * Created by frank on 2/21/15.
 */

var util = require('util');
var request = require('request');
var requestPromise = require('request-promise');
var parseString = require('xml2js').parseString;
var _ = require('underscore');
var Authenticator = require('./authenticator').Authenticator;

function PlexAuthenticator() {

}
util.inherits(PlexAuthenticator, Authenticator);

PlexAuthenticator.prototype.authenticate = function (username, password) {

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
            var authenticationToken = '';
            parseString(body, function (err, result) {
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
        this.token = token;
        return token;
    });
};

exports.PlexAuthenticator = PlexAuthenticator;
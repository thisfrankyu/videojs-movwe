/**
 * Created by frank on 2/1/15.
 */
var util = require('util');
var request = require('request');
var requestPromise = require('request-promise');
var parseString = require('xml2js').parseString;
var _ = require('underscore');


function Authenticator(){

}

Authenticator.prototype.authenticate = function (username, password) {
    return 'token';
}

function PlexAuthenticator(){

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
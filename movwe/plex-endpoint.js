var util = require('util');
var request = require('request');
var requestPromise = require('request-promise');
var parseString = require('xml2js').parseString;
var _ = require('underscore');
var PlexUrl = require('./plex-url').PlexUrl;

function PlexEndpoint() {

}

PlexEndpoint.prototype.getLibrary = function (token) {
    var url = new PlexUrl().getLibraryRequest(token);
    console.log("url: " + url);
    var options = {
        url: url,
        resolveWithFullResponse:true
    };
    return requestPromise.get(options).then(function(response) {
        console.log("response: " + response);
        console.log("response.body: " + response.body);
    });
};

exports.PlexEndpoint = PlexEndpoint;
var util = require('util');
var request = require('request');
var requestPromise = require('request-promise');
var parseString = require('xml2js').parseString;

class PlexEndpoint {
    constructor(host, port) {
        this.plexurl = new PlexUrl(host, port);
    }

    getLibrary(callback) {
        this.sendRequest(this.plexurl.libraryRequest, callback);
    }

    getMetadata(key, callback) {
        this.sendRequest(this.plexurl.getMetadataRequest(key), callback);
    }

    getSections(callback) {
        this.sendRequest(this.plexurl.sectionsRequest, callback);
    }

    getSearchResults(query, callback) {
        this.sendRequest(this.plexurl.getSearchRequest(query), callback);
    }

    sendRequest(uri, callback) {
        requestPromise.get({ uri: uri }).then(
            (xmlResponse) => parseString(xmlResponse, (err, result) => callback(result)),
            (err) => console.log("Error getting results from request " + options.uri));
    }
}

class PlexUrl {
    constructor(host, port) {
        this.plexurl = 'http://'.concat(host, ':', port);
    }

    get libraryRequest() {
        return this.plexurl.concat('/library/all');
    }

    get sectionsRequest() {
        return this.plexurl.concat('/library/sections');
    }

    getMetadataRequest(key) {
        return this.plexurl.concat('/library/metadata/', key, '/children');
    }
    
    getSearchRequest(query) {
        return this.plexurl.concat('/search?query=', query);
    }
}

exports.PlexEndpoint = PlexEndpoint;
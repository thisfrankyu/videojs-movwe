var _ = require('underscore');

function PlexUrl() {

}

PlexUrl.prototype.getLibraryRequest = function(token) {
    var urlVars = this.getUrlVars(this.plexHeaders(token));
    console.log("urlVars: " + urlVars);
    console.log("blah: " );
    return "http://10.0.0.2:32400/library/all?X-Plex-Client-Identifier=ktu960u2urn0o1o".concat(urlVars);
};

PlexUrl.prototype.getUrlVars = function(json) {
    return _.reduce(json, function(memo, val, key) {
        return memo + key + val;
    }, "");
};

PlexUrl.prototype.plexHeaders = function(token) {
    return {
        "&X-Plex-Product=": "MovWe",
        "&X-Plex-Device=": "Windows",
        "&X-Plex-Platform=": "Chrome",
        "&X-Plex-Platform-Version=": "40.0",
        "&X-Plex-Version=": "2.2.7",
        "&X-Plex-Device-Name=": "MovWe+(Chrome)",
        "&X-Plex-Token=" : token
    };
};

/*
function PlexUrl(host, metadataId, port, token, username, options) {
    if (typeof host !== 'string' || host === '') {
        throw new Error('host must be a string');
    }
    if (typeof metadataId !== 'string') {
        throw new Error('metadataId must be a string');
    }
    if (typeof port !== 'string') {
        throw new Error('port must be a string');
    }
    if (typeof token !== 'string' || token === '') {
        throw new Error('token must be a string');
    }
    if (typeof username !== 'string') {
        throw new Error('username must be a string');
    }
    this.host = host;
    this.metadataId = metadataId;
    this.port = port;
    this.token = token;
    this.username = username;
    this.options = {
        mediaIndex: 0,
        partIndex: 0,
        protocol: "http",
        offset: 0,
        fastSeek: 1,
        directPlay: 0,
        directStream: 1,
        videoQuality: 60,
        videoResolution: "640x360",
        maxVideoBitrate: 2000,
        subtitleSize: 100,
        audioBoost: 100,
        session: "ygepu1ko61dcxr",
        xPlexClientId: "ktu960u2urn0o1or",
        xPlexProduct: "MovWe",
        xPlexDevice: "Windows",
        xPlexPlatform: "Chrome",
        xPlexPlatformVersion: "40.0",
        xPlexVersion: "2.2.7",
        xPlexDeviceName: "MovWe+(Chrome)"
    };
    this.options = _.defaults(options, this.options);
}

PlexUrl.prototype.toString = function () {
    return "http://" + this.host + ":" + this.port + "/video/:/transcode/universal/start"
        + "?path=http%3A%2F%2F127.0.0.1%3A32400%2Flibrary%2Fmetadata%2F" + this.metadataId
        + "&mediaIndex=" + this.options.mediaIndex
        + "&partIndex=" + this.options.partIndex
        + "&protocol=" + this.options.protocol
        + "&offset=" + this.options.offset
        + "&fastSeek=" + this.options.fastSeek
        + "&directPlay=" + this.options.directPlay
        + "&directStream=" + this.options.directStream
        + "&videoQuality=" + this.options.videoQuality
        + "&videoResolution=" + this.options.videoResolution
        + "&maxVideoBitrate=" + this.options.maxVideoBitrate
        + "&subtitleSize=" + this.options.subtitleSize
        + "&audioBoost=" + this.options.audioBoost
        + "&session=" + this.options.session
        + "&X-Plex-Client-Identifier=" + this.options.xPlexClientId
        + "&X-Plex-Product=" + this.options.xPlexProduct
        + "&X-Plex-Device=" + this.options.xPlexDevice
        + "&X-Plex-Platform=" + this.options.xPlexPlatform
        + "&X-Plex-Platform-Version=" + this.options.xPlexPlatformVersion
        + "&X-Plex-Version=" + this.options.xPlexVersion
        +  + this.token
        + "&X-Plex-Username=" + this.username
        + "&X-Plex-Device-Name=" + this.options.xPlexDeviceName;
};
*/
exports.PlexUrl = PlexUrl;

// /:/timeline
// ?X-Plex-Platform=<val>
// &playQueueItemID=<val>
// &X-Plex-Token=<val>
// &X-Plex-Platform-Version=<val>
// &X-Plex-Client-Platform=<val>
// &X-Plex-Client-Identifier=<val>
// &ratingKey=<val>
// &X-Plex-Device=<val>
// &X-Plex-Username=<val>
// &state=<val>
// &X-Plex-Product=<val>
// &key=<val>
// &time=<val>
// &duration=<val>
// &X-Plex-Model=<val>
// &identifier=<val>
// &X-Plex-Device-Name=<val>
// &X-Plex-Version=<val>

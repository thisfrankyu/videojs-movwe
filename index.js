

function onload() {
	var socket = io();
	var myPlayer = videojs('example_video_1');
	myPlayer.src({type: "video/webm", src: videoURL("10.0.0.2", "22") });

	myPlayer.on('pause', function () {
		console.log('video paused, sending pause');
		socket.emit('pause');
	});

	myPlayer.on('play', function () {
		console.log('video played, sending play');
		socket.emit('play');
	});

	socket.on('hi', function(){
		console.log('hi');
	});
	$('#pause').click(function(){
		console.log('pause clicked, sending pause');
		socket.emit('pause');
	});
	$('#play').click(function(){
		console.log('play clicked, sending play');
		socket.emit('play');
	});
	socket.on('command', function(msg){
		console.log('received command:' + msg);
		if (msg === 'pause'){
			pause();
		}
		if (msg === 'play'){
			play();
		}
	});

	socket.on('pause', function(){
		console.log('received pause');
		pause();
	});
	socket.on('play', function(){
		console.log('received pause');
		play();
	});

}

window.onload = onload;

function videoURL(host, metadataID) {
	return "http://"+host+":32400/video/:/transcode/universal/start"
		+"?path=http%3A%2F%2F"+host+"%3A32400%2Flibrary%2Fmetadata%2F"+ metadataID
		+"&mediaIndex=0"
		+"&partIndex=0"
		+"&protocol=http"
		+"&offset=0"
		+"&fastSeek=1"
		+"&directPlay=0"
		+"&directStream=1"
		+"&videoQuality=60"
		+"&videoResolution=640x360"
		+"&maxVideoBitrate=2000"
		+"&subtitleSize=100"
		+"&audioBoost=100"
		+"&session=ygepu1ko61dcxr"
		+"&X-Plex-Client-Identifier=ktu960u2urn0o1or"
		+"&X-Plex-Product=MovWe"
		+"&X-Plex-Device=Windows"
		+"&X-Plex-Platform=Chrome"
		+"&X-Plex-Platform-Version=40.0"
		+"&X-Plex-Version=2.2.7"
		+"&X-Plex-Device-Name=MovWe+(Chrome)";
}



function PlexUrl(host, metadataId, options) {
	if (typeof host !== 'string' || host === '') {
		throw new Error('host must be a string');
	}
	if (typeof metadataId !== 'string') {
		throw new Error('metadataId must be a string');
	}
	this.host = host;
	this.metadataId = metadataId;
	this.mediaIndex = options.mediaIndex;
	this.partIndex = options.partIndex;
	this.protocol = options.protocol;
	this.offset = options.offset;
	this.fastSeek = options.fastSeek;
	this.directPlay = options.directPlay;
	this.directStream = options.directStream;
	this.videoQuality = options.videoQuality;
	this.videoResolution = options.videoResolution;
	this.maxVideoBitrate = options.maxVideoBitrate;
	this.subtitleSize = options.subtitleSize;
	this.audioBoost = options.audioBoost;
	this.session = options.session;
	this.xPlexClientId = options.xPlexClientId;
	this.xPlexProduct = options.xPlexProduct;
	this.xPlexPlatform = options.xPlexPlatform;
	this.xPlexPlatformVersion = options.xPlexPlatformVersion;
	this.xPlexVersion = options.xPlexVersion;
	this.xPlexDeviceName = options.xPlexDeviceName;
}

PlexUrl.prototype.toString = function () {

}


function plexUrlToString(plexUrl){
	return "http://"+plexUrl.host+":32400/video/:/transcode/universal/start"
		+"?path=http%3A%2F%2F"+plexUrl.host+"%3A32400%2Flibrary%2Fmetadata%2F"+ plexUrl.metadataId
		+"&mediaIndex=0"
		+"&partIndex=0"
		+"&protocol=http"
		+"&offset=0"
		+"&fastSeek=1"
		+"&directPlay=0"
		+"&directStream=1"
		+"&videoQuality=60"
		+"&videoResolution=640x360"
		+"&maxVideoBitrate=2000"
		+"&subtitleSize=100"
		+"&audioBoost=100"
		+"&session=ygepu1ko61dcxr"
		+"&X-Plex-Client-Identifier=ktu960u2urn0o1or"
		+"&X-Plex-Product=MovWe"
		+"&X-Plex-Device=Windows"
		+"&X-Plex-Platform=Chrome"
		+"&X-Plex-Platform-Version=40.0"
		+"&X-Plex-Version=2.2.7"
		+"&X-Plex-Device-Name=MovWe+(Chrome)";

}

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

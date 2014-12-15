

function onload() {
	var socket = io();
	var myPlayer = videojs('example_video_1');

	var authToken = '';
	var address = $('#address').val();
	var metadata = $('#metadata').val();
	var WAIT_MS = 10000;


	function playEveryone(){
		console.log("play called");
		console.log('video played, sending play');
		socket.emit('play');
		myPlayer.play();
	}

	function pauseEveryone(){
		console.log("pause called, current time: " + myPlayer.currentTime() + '/' + myPlayer.duration());
		console.log('video paused, sending pause');
		socket.emit('pause');
		myPlayer.pause();
	}

	socket.on('hi', function(sessionId){
		console.log('hi: ' + sessionId);
	});
	/*$('#pause').click(function(){
		console.log('pause clicked, sending pause');
		socket.emit('pause');
	});
	$('#play').click(function(){
		console.log('play clicked, sending play');
		socket.emit('play');
	});*/
	socket.on('command', function(msg){
		console.log('received command:' + msg);
		if (msg === 'pause'){
			pauseEveryone();
		}
		if (msg === 'play'){
			playEveryone();
		}
	});
	$('#pause').click(function(){
		console.log('pause clicked, sending pause');
		pauseEveryone();
	});
	$('#play').click(function(){
		console.log('play clicked, sending play');
		playEveryone();
	});
	socket.on('pause', function(){
		console.log('received pause');
		myPlayer.pause();
	});
	socket.on('play', function(){
		console.log('received pause');
		myPlayer.play();
	});

	socket.on('token', function(token){
		authToken = token;
		myPlayer.src({type: "video/webm", src: videoURL(address, metadata, authToken, 'blah') });
	});

	setInterval(function(){
		if(myPlayer.currentTime !== undefined){
			console.log('emitting time: ' + myPlayer.currentTime())
			socket.emit('time', myPlayer.currentTime());
		}
	}, 1000);

	event.stopPropagation();
}

//window.onload = onload;
$(function () {
	$('#load').click(onload);
});

function videoURL(host, metadataID, token, username) {
	return "http://"+host+":32400/video/:/transcode/universal/start"
		+ "?path=http%3A%2F%2F127.0.0.1%3A32400%2Flibrary%2Fmetadata%2F" + metadataID
		+ "&mediaIndex=0"
		+ "&partIndex=0"
		+ "&protocol=http"
		+ "&offset=0"
		+ "&fastSeek=1"
		+ "&directPlay=0"
		+ "&directStream=1"
		+ "&videoQuality=60"
		+ "&videoResolution=640x360"
		+ "&maxVideoBitrate=2000"
		+ "&subtitleSize=100"
		+ "&audioBoost=100"
		+ "&session=ygepu1ko61dcxr"
		+ "&X-Plex-Client-Identifier=ktu960u2urn0o1or"
		+ "&X-Plex-Product=MovWe"
		+ "&X-Plex-Device=Windows"
		+ "&X-Plex-Platform=Chrome"
		+ "&X-Plex-Platform-Version=40.0"
		+ "&X-Plex-Version=2.2.7"
		+ "&X-Plex-Token=" + token
		+ "&X-Plex-Username=" + username
		+ "&X-Plex-Device-Name=MovWe+(Chrome)";
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
		+"&fastSeek=0"
		+"&directPlay=0"
		+"&directStream=0"
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

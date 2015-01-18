var socket;
var videoPlayer;

function onLoad() {
	videoPlayer = videojs('main_video');

	$('#pause').click(function(){
		console.log('pause clicked, sending pause');
		pauseEveryone();
	});
	$('#play').click(function(){
		console.log('play clicked, sending play');
		playEveryone();
	});
}

function loadVideo(event) {
	if(socket === undefined) {
		socket = io();

		socket.on('hi', function(sessionId){
			console.log('hi: ' + sessionId);
		});
		socket.on('command', function(msg){
			console.log('received command:' + msg);
			if (msg === 'pause'){
				pauseEveryone();
			}
			if (msg === 'play'){
				playEveryone();
			}
		});
		socket.on('pause', function(){
			console.log('received pause');
			videoPlayer.pause();
		});
		socket.on('play', function(){
			console.log('received pause');
			videoPlayer.play();
		});
	}
	var authToken = '';

	var address = $('#address').val();
	var metadata = $('#metadata').val();

	socket.emit('auth', {}, function(token){
		authToken = token;
		videoPlayer.src({type: "video/webm", src: videoURL(address, metadata, authToken, 'blah') });
	});

	setInterval(function(){
		if(videoPlayer.currentTime !== undefined){
			console.log('emitting time: ' + videoPlayer.currentTime());
			socket.emit('time', videoPlayer.currentTime());
		}
	}, 1000);

	event.preventDefault();
}

//window.onLoad = onLoad;
$(function () {
	onLoad();
	$('#addressForm').submit(loadVideo);
});

function playEveryone(){
	console.log("play called");
	console.log('video played, sending play');
	socket.emit('play');
	videoPlayer.play();
}

function pauseEveryone(){
	console.log("pause called, current time: " + videoPlayer.currentTime() + '/' + videoPlayer.duration());
	console.log('video paused, sending pause');
	socket.emit('pause');
	videoPlayer.pause();
}

function videoURL(host, metadataID, token, username, resolution) {
	if (resolution === undefined){
		resolution = "640x360";
	}
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
		+ "&videoResolution=" + resolution
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

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

function parseEpisode(callback, xml){
	console.log("parsingEpisode");
	var episodeInfo = {};
	$(xml).find("Video").each(function () {
		// if ($(this).attr("type") !== 'episode') {
		// 	return {};
		// }
		episodeInfo = {
			grandparentTitle: $(this).attr("grandparentTitle"),
			episodeNumber: $(this).attr("index"),
			title: $(this).attr("title"),
			metadataId: $(this).attr("ratingKey"),
			partId: $(this).find("Part").first().attr("id"),
			partKey: $(this).find("Part").first().attr("key")
		};
		console.log(JSON.stringify(episodeInfo, null, 2));
	});

	callback(episodeInfo);
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
			console.log('received play');
			videoPlayer.play();
		});
		socket.on('seek', function(time) {
			console.log('received seek');
			if(!videoPlayer.seeking()) {
				videoPlayer.currentTime(time);
			}
		})
	}

	$('#pause').removeAttr("disabled");
	$('#play').removeAttr("disabled");

	var authToken = '';

	var address = $('#address').val();
	var metadata = $('#metadata').val();
	var port = $('#port').val();
	var resolution = $('input:radio[name=resolution]:checked').val();
	var hrs = $('#hours').val();
	var mins = $('#minutes').val();
	var secs = $('#seconds').val();
	var offset = moment.duration({
		seconds: secs,
		minutes: mins,
		hours: hrs
	}).asSeconds();

	socket.emit('auth', {}, function(token){
		authToken = token[0];

		var setVideoPlayerSrc = function (src) {
			videoPlayer.src({
				type: "video/webm",
				src: src.toString()
			});
		};

		var setToPlexDirectUrl = function (episodeInfo) {
			var plexURL = new PlexDirectUrl(address, episodeInfo.partKey, port, authToken, 'blah', {});
			setVideoPlayerSrc(plexURL);
		}

		if(resolution == "original") {

			$.ajax({
				type: "GET",
				url: new PlexMetadataUrl(address, metadata, port, authToken),
				dataType: "xml",
				success: parseEpisode.bind({}, setToPlexDirectUrl)
			});
		}
		else {
			setVideoPlayerSrc(
				new PlexUrl(address, metadata, port, authToken, 'blah', {videoResolution: resolution, offset: offset}));
		}
	});

	var previousTime = undefined;
	setInterval(function(){
		if(videoPlayer.currentTime !== undefined && videoPlayer.currentTime() !== previousTime){
			console.log('emitting time: ' + videoPlayer.currentTime());
			socket.emit('time', videoPlayer.currentTime());
			previousTime = videoPlayer.currentTime();
		}
	}, 1000);

	var seekTime = undefined;
	videoPlayer.on('seeked', function() {
		if(videoPlayer.currentTime() !== seekTime) {
			console.log('video seeked, sending seek');
			seekEveryone();
			seekTime = videoPlayer.currentTime();
		}
	});

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

function seekEveryone() {
	console.log("player seeked to " + videoPlayer.currentTime());
	console.log("sending seek");
	socket.emit('seek', videoPlayer.currentTime());
}


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
	return "http://"+this.host+":"+this.port+"/video/:/transcode/universal/start"
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
		+ "&X-Plex-Token=" + this.token
		+ "&X-Plex-Username=" + this.username
		+ "&X-Plex-Device-Name=" + this.options.xPlexDeviceName;
};

function PlexDirectUrl(host, partKey, port, token, username, options) {
	if (typeof host !== 'string' || host === '') {
		throw new Error('host must be a string');
	}
	if (typeof partKey !== 'string') {
		throw new Error('partKey must be a string');
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
	this.partKey = partKey;
	this.port = port;
	this.token = token;
	this.username = username;
	this.options = {
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

PlexDirectUrl.prototype.toString = function () {
	return "http://"+this.host+":"+this.port + this.partKey
		+ "&session=" + this.options.session
		+ "&X-Plex-Client-Identifier=" + this.options.xPlexClientId
		+ "&X-Plex-Product=" + this.options.xPlexProduct
		+ "&X-Plex-Device=" + this.options.xPlexDevice
		+ "&X-Plex-Platform=" + this.options.xPlexPlatform
		+ "&X-Plex-Platform-Version=" + this.options.xPlexPlatformVersion
		+ "&X-Plex-Version=" + this.options.xPlexVersion
		+ "&X-Plex-Token=" + this.token
		+ "&X-Plex-Username=" + this.username
		+ "&X-Plex-Device-Name=" + this.options.xPlexDeviceName;
};

function PlexMetadataUrl(host, metadataId, port, token) {
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
	this.host = host;
	this.metadataId = metadataId;
	this.port = port;
	this.token = token;
}

PlexMetadataUrl.prototype.toString = function () {
	return "http://"+this.host+":"+this.port+"/library/metadata/" + this.metadataId + "?X-Plex-Token=" + this.token;
};

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

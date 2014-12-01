function onload() {
	var socket = io();
	var myPlayer = videojs('example_video_1');

	var address = $('#address').val();
	var metadata = $('#metadata').val();
	myPlayer.src({type: "video/webm", src: videoURL(address, metadata) });
	var WAIT_MS = 10000;


	function play(){
		console.log("play called");
		myPlayer.play();
	}

	function pause(){
		console.log("pause called");
		myPlayer.pause();
	}

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

	event.stopPropagation();
}

//window.onload = onload;
$(function () {
	$('#load').click(onload);
});

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

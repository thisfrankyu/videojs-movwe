function onload() {
	
	var myPlayer = videojs('example_video_1');
	var WAIT_MS = 10000;


	function play(){
		console.log("play called");
		myPlayer.play();
	}

	function pause(){
		console.log("pause called");
		myPlayer.pause();
	}
	
	console.log("onload called, waiting " + WAIT_MS);
	setTimeout(play, WAIT_MS);
	setTimeout(pause, WAIT_MS + 5000);
}


window.onload = onload;
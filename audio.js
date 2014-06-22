// Load main library
var Game = window.Game || {};

(function() {

	var cache = {};
	Game.playSound = function(filename) {
		if(!cache.hasOwnProperty(filename)) {
			var audio = new Audio(),
				cacheLine = {sound: audio, ready: false};
			audio.addEventListener("canplaythrough", function() {
				cacheLine.ready = true;
				audio.play();
			}, true);
			cache[filename] = cacheLine;
			audio.src = filename;
		} else {
			if(cache[filename].ready)
				cache[filename].sound.play();
		}
	};

	Game.startMusic = function() {
		var loop = new Audio();
		var playThis = loop.play;
		var playIntro = function() {
			loop.removeEventListener('canplaythrough', playIntro, true);
			var intro = new Audio();
			intro.addEventListener('canplaythrough', playThis, true);
			intro.addEventListener('ended', function() {loop.play();}, true);
			intro.src = 'intro.ogg';
		};
		loop.addEventListener('ended', playThis, true);
		loop.addEventListener('canplaythrough', playIntro, true);
		loop.src = 'loop.ogg';
	};

}());

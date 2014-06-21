// Load main library
var Game = window.Game || {};

Game.drawImage = (function() {
	// Image cache
	var images = {};
	// List of all images in the game
	var	imageList = [
			'hello.png',
			'testwall.png',
			'player.png',
			'player_cast.png',
			'explosion.png',
			'enemy.png'
		];
	
	// Pre-load all images
	Game.loadImages = function(callback) {
		var numLoadedImages = 0, i;
		
		for(i = 0;  i < imageList.length;  ++i) {
			img = new Image();
			images[imageList[i]] = img;
			// Call the callback after all images are loaded
			img.onload = function() {
				++numLoadedImages;
				if(numLoadedImages == imageList.length)
					callback();
			};
			img.src = imageList[i];
		}
	}

	// Draw an image
	return function (ctx, filename, x, y) {
		ctx.drawImage(images[filename], x, y);
	};
}());

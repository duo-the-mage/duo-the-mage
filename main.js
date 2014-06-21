var ctx, lastFrameTime, fps, anykey, imageList, images;

window.onload = function() {
	var c = document.getElementById("myCanvas"),
		i, img, numLoadedImages;
	
	ctx = c.getContext("2d");
	
	ctx.moveTo(0,0);
	ctx.lineTo(200,100);
	ctx.stroke();

/*
	// Audio test case.
	playSound("hello.wav");
	setTimeout(function() {
		playSound("hello.wav");
	}, 3000);
*/

	// Pre-load all images, and then start the game.
	images = {};
	numLoadedImages = 0;
	for(i = 0;  i < imageList.length;  ++i) {
		img = new Image();
		images[imageList[i]] = img;
		img.onload = function() {
			++numLoadedImages;
			if(numLoadedImages == imageList.length)
				gameLoop();
		};
		img.src = imageList[i];
	}

	document.addEventListener("keydown",function() {
		anykey = true;
	},false);
	
	document.addEventListener("keyup",function() {
		anykey = false;
	},false);
};

function gameLoop(_timestamp) {
	if (lastFrameTime) {
		fps = 1000/(_timestamp - lastFrameTime);
	}
	lastFrameTime = _timestamp;

	onUpdate();
	draw();
	
	window.requestAnimationFrame(gameLoop);
};

function onUpdate() {
	// Nothing here yet...
};

function draw() {
	ctx.fillStyle = "#fff";
	ctx.fillRect(0,0,200,100);
	ctx.fillStyle = "#000";
	ctx.fillText(Math.round(fps)+" fps",2,10);
	
	if (anykey) {
		ctx.beginPath();
		ctx.fillStyle = "#0b0";
		ctx.arc(50,50,20,0,2*Math.PI,false);
		ctx.fill();
	}
	
	drawImage(ctx, 'hello.png', 16, 32);
};

// Is there a reason for "function f" vs "var f = function"?
var playSound = (function() {
	var cache = {};
	return function(filename) {
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
}());

imageList = [
	'hello.png'
];

function drawImage(ctx, filename, x, y) {
	ctx.drawImage(images[filename], x, y);
}

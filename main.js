var ctx, img, lastFrameTime, fps, anykey;

window.onload = function() {
	var c = document.getElementById("myCanvas");
	
	ctx = c.getContext("2d");
	
	ctx.moveTo(0,0);
	ctx.lineTo(200,100);
	ctx.stroke();

	playSound("hello.wav");

	img = new Image();
	img.src = 'hello.png';
	img.onload = function() {	
		gameLoop();
	};
		
	document.addEventListener("keydown",function() {
		anykey = true;
	},false);
	
	document.addEventListener("keyup",function() {
		anykey = false;
	},false);
	
}

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
	
	ctx.drawImage(img, 16, 32);
};

// Is there a reason for "function f" vs "var f = function"?
var playSound = function(filename) {
	var audio = new Audio();
	audio.addEventListener("canplaythrough", function() {
		audio.play();
	}, true);
	audio.src = filename;
}

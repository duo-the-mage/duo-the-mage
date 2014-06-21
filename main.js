// Load main library
var Game = window.Game || {};

var ctx, lastFrameTime, fps, keys, imageList, images, lastKey;



window.onload = function() {
	var c = document.getElementById("myCanvas");
	
	ctx = c.getContext("2d");

/*
	// Canvas test case.
	ctx.moveTo(0,0);
	ctx.lineTo(200,100);
	ctx.stroke();

	// Audio test case.
	playSound("hello.wav");
	setTimeout(function() {
		playSound("hello.wav");
	}, 3000);
*/

	keys = {};

	// Initialize game
	Game.player = {x: 0, y: 0};

	var keymap = {
			65: 'a',
			68: 'd',
			83: 's',
			87: 'w'
		};
	document.addEventListener("keydown",function(e) {
		lastKey = e.keyCode;
		keys[keymap[e.keyCode]] = true;
	},false);
	document.addEventListener("keyup",function(e) {
		keys[keymap[e.keyCode]] = false;
	},false);

	Game.loadImages(gameLoop);
};

function gameLoop(_timestamp) {
	var elapsed;
	if (lastFrameTime) {
		elapsed = _timestamp - lastFrameTime;
		fps = 1000/elapsed;
		onUpdate(elapsed);
		draw();
	}
	lastFrameTime = _timestamp;

	window.requestAnimationFrame(gameLoop);
};

function onUpdate(elapsed) {
	// Move player
	var SPEED = 0.1;
	if((keys['w'] || keys['s']) && (keys['a'] || keys['d']))
		SPEED *= 0.707;
	if(keys["w"])
		Game.player.y -= elapsed * SPEED;
	if(keys["a"])
		Game.player.x -= elapsed * SPEED;
	if(keys["s"])
		Game.player.y += elapsed * SPEED;
	if(keys["d"])
		Game.player.x += elapsed * SPEED;
};

function draw() {
	// Debugging stuff
	ctx.fillStyle = "#fff";
	ctx.fillRect(0,0,200,100);
	ctx.fillStyle = "#000";
	ctx.fillText(Math.round(fps)+" fps; "+lastKey+' '+Game.player.y,2,10);
	if (keys["w"]) {
		ctx.beginPath();
		ctx.fillStyle = "#0b0";
		ctx.arc(50,50,20,0,2*Math.PI,false);
		ctx.fill();
	}
	Game.drawImage(ctx, 'hello.png', 16, 32);

	// Draw player
	Game.drawImage(ctx, 'player.png', Game.player.x, Game.player.y);
};

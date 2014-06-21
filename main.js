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

	Game.loadImages(start);
};

function start() {
	var i, w;
	for (i = 0; i < 10; ++i) {
		w = new Game.Wall();
		w.x = i * 32;
		w.y = 0;
	}

	gameLoop();
}

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

Game.movePlayer = function(elapsed) {
	// Move player
	var SPEED = 0.1;
	var dir = {x: 0, y: 0};
	if(keys['a'])
		--dir.x
	if(keys['d'])
		++dir.x;
	if(keys['w'])
		--dir.y;
	if(keys['s'])
		++dir.y;
	if(dir.x != 0  &&  dir.y != 0)
		SPEED *= 0.707;
	Game.player.x += dir.x * elapsed * SPEED;
	Game.player.y += dir.y * elapsed * SPEED;

	var GRID_SIZE
	var resolveCollisions = function(x, y) {
		Math.floor(x/GRID_SIZE, y/GRID_SIZE);
	};
};

function onUpdate(elapsed) {
	Game.movePlayer(elapsed);
};

function draw() {
	var i;

	// Clear the screen
	ctx.fillStyle = "#fff";
	ctx.fillRect(0,0,800,480);
	
	// Draw walls
	for (i = 0; i < Game.walls.length; ++i) {
		Game.walls[i].draw(ctx);
	}
	
	// Draw test circle for input
	if (keys["w"]) {
		ctx.beginPath();
		ctx.fillStyle = "#0b0";
		ctx.arc(50,50,20,0,2*Math.PI,false);
		ctx.fill();
	}
	
	// Draw test image
	Game.drawImage(ctx, 'hello.png', 16, 32);
	
	// Draw player
	Game.drawImage(ctx, 'player.png', Math.round(Game.player.x), Math.round(Game.player.y));
	
	// Draw fps counter
	ctx.fillStyle = "#000";
	ctx.fillText(Math.round(fps)+" fps; "+lastKey+' '+Game.player.y,2,10);
};

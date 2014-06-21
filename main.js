// Load main library
var Game = window.Game || {};

var ctx, lastFrameTime, fps;



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

	// Initialize game
	Game.player = {x: 0, y: 0};


	Game.loadImages(start);
};

function start() {
	var i, w;
	for (i = 0; i < 10; ++i) {
		w = new Game.Wall();
		w.x = i * 32;
		w.y = 0;
	}

	Game.Input.init();
	
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

function onUpdate(elapsed) {
	// Move player
	var SPEED = 0.1,
		keys = Game.Input.keys;
	if((keys['w'] || keys['s']) && (keys['a'] || keys['d']))
		SPEED *= 0.707;
	if(keys['w'])
		Game.player.y -= elapsed * SPEED;
	if(keys['a'])
		Game.player.x -= elapsed * SPEED;
	if(keys['s'])
		Game.player.y += elapsed * SPEED;
	if(keys['d'])
		Game.player.x += elapsed * SPEED;
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
	if (Game.Input.keys["w"]) {
		ctx.beginPath();
		ctx.fillStyle = "#0b0";
		ctx.arc(50,50,20,0,2*Math.PI,false);
		ctx.fill();
	}
	
	// Draw test image
	Game.drawImage(ctx, 'hello.png', 16, 32);
	
	// Draw player
	Game.drawImage(ctx, 'player.png', Math.round(Game.player.x), Math.round(Game.player.y));
	
	// Draw mouse test
	ctx.beginPath();
	ctx.fillStyle = (Game.Input.mouse.button ? "#00f" : "#f00");
	ctx.arc(Game.Input.mouse.x,Game.Input.mouse.y,2,0,2*Math.PI,false);
	ctx.fill();
	
	// Draw fps counter
	ctx.fillStyle = "#000";
	ctx.fillText(Math.round(fps)+" fps; "+Game.Input.lastKey+' '+Game.player.y,2,10);
};

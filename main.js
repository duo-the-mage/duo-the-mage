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
	Game.loadImages(start);
};

function start() {
	var i, w;
	for (i = 0; i < 10; ++i) {
		Game.addWall(i, 3);
	}
	Game.addWall(12,2);
	Game.addWall(14,2);
	Game.addWall(14,4);
	Game.addWall(12,4);
	Game.addWall(11,5);
	Game.addWall(15,5);
//	Game.addWall(11,4);

	Game.addWall(8,8);
	Game.addWall(15,9);
	Game.addWall(14,13);
	Game.addWall(7,12);
	Game.addEnemyBug(8,12);

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
	var i;

	Game.player.update(elapsed);
	
	if (Game.currentSpell) { Game.currentSpell.update(elapsed); }
	
	for (i = 0; i < Game.actors.length; ++i) {
		Game.actors[i].update(elapsed);
	}
	
	for (i = Game.actors.length-1; i >= 0;--i) {
		if (Game.actors[i].isDestroyed) {
			Game.actors.splice(i,1);
		}
	}
};

function draw() {
	var i;

	// Draw background
	Game.drawImage(ctx, 'background.png', 0, 0);
	
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
	
	// Draw enemies
	for (i = 0; i < Game.actors.length; ++i) {
		Game.actors[i].draw(ctx);
	}
	
	// Draw player
	Game.player.draw(ctx);
	
	// Draw current spell
	if (Game.currentSpell) { Game.currentSpell.draw(ctx); }
	
	// Draw UI
	Game.player.drawUI(ctx);
	
	// Draw mouse test
	/*ctx.beginPath();
	ctx.fillStyle = (Game.Input.mouse.button ? "#00f" : "#f00");
	ctx.arc(Game.Input.mouse.x,Game.Input.mouse.y,2,0,2*Math.PI,false);
	ctx.fill();
	
	// Draw fps counter
	ctx.fillStyle = "#000";
	ctx.fillText(Math.round(fps)+" fps; "+Game.Input.lastKey+' '+Game.player.y,2,10);*/
};

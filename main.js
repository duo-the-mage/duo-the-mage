// Load main library
var Game = window.Game || {};

var ctx, lastFrameTime, fps;

(function handlePageVisibility() {
	var hidden, visibilityChange; 
	if (typeof document.hidden !== "undefined") { // Opera 12.10 and Firefox 18 and later support 
	  hidden = "hidden";
	  visibilityChange = "visibilitychange";
	} else if (typeof document.mozHidden !== "undefined") {
	  hidden = "mozHidden";
	  visibilityChange = "mozvisibilitychange";
	} else if (typeof document.msHidden !== "undefined") {
	  hidden = "msHidden";
	  visibilityChange = "msvisibilitychange";
	} else if (typeof document.webkitHidden !== "undefined") {
	  hidden = "webkitHidden";
	  visibilityChange = "webkitvisibilitychange";
	}
	
	function handleVisibilityChange() {
		console.log("VC");
	
		if (document[hidden]) {
			Game.pause();
		} else {
			Game.resume();
		}
	};
	
	document.addEventListener(visibilityChange, handleVisibilityChange, false);
	window.addEventListener("blur",function() { Game.pause(); }, false);
	window.addEventListener("focus",function() { Game.resume(); }, false);
  
}());

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
	Game.addLockedDoor(10,4);
//	Game.addWall(11,4);

	Game.addWall(8,8);
	Game.addWall(15,9);
	Game.addWall(14,13);
	Game.addWall(7,12);
	Game.addEnemyBug(8,12);
	Game.addEnemyBug(8,12);
	Game.addEnemyBug(8,12);
	Game.addEnemyBug(8,12);
	Game.addEnemyBug(8,12);
	Game.addEnemyBug(8,12);
	Game.addEnemyBug(8,12);
	Game.addEnemyBug(8,12);
	Game.addEnemyBug(8,12);
	Game.addEnemyBug(8,12);

	Game.Input.init();
	
	gameLoop();
}

Game.pause = function pause() {
	if (this.nextFrame) {
		window.cancelAnimationFrame(this.nextFrame);
		ctx.beginPath();
		ctx.fillStyle = "rgba(0,0,0,0.5)";
		ctx.rect(0,0,800,480);
		ctx.fill();
		this.nextFrame = null;
	}
};

Game.resume = function resume() {
	if (!this.nextFrame) {
		lastFrameTime = null;
		gameLoop(lastFrameTime);
	}
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

	Game.nextFrame = window.requestAnimationFrame(gameLoop);
};

function onUpdate(elapsed) {
	var i;

	Game.player.update(elapsed);

	Game.camera.update(elapsed);
	
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
	
	ctx.translate(-Game.camera.x,-Game.camera.y);

	// Draw background
	(function() {
		var WIDTH = 800, HEIGHT = 480;
		var x = Math.floor(Game.camera.x / WIDTH) * WIDTH;
		var y = Math.floor(Game.camera.y / HEIGHT) * HEIGHT;
		Game.drawImage(ctx, 'background.png', x, y);
		Game.drawImage(ctx, 'background.png', x+WIDTH, y);
		Game.drawImage(ctx, 'background.png', x, y+HEIGHT);
		Game.drawImage(ctx, 'background.png', x+WIDTH, y+HEIGHT);
	}());

	// Draw walls
	for (i = 0; i < Game.walls.length; ++i) {
		Game.walls[i].draw(ctx);
	}
	
	// Draw test circle for input
	/*
	if (Game.Input.keys["w"]) {
		ctx.beginPath();
		ctx.fillStyle = "#0b0";
		ctx.arc(50,50,20,0,2*Math.PI,false);
		ctx.fill();
	}
	
	// Draw test image
	Game.drawImage(ctx, 'hello.png', 16, 32);
	*/
	// Draw enemies
	for (i = 0; i < Game.actors.length; ++i) {
		Game.actors[i].draw(ctx);
	}
	
	// Draw player
	Game.player.draw(ctx);
	
	// Draw current spell
	if (Game.currentSpell) { Game.currentSpell.draw(ctx); }
	
	ctx.translate(Game.camera.x,Game.camera.y);
	
	// Draw UI
	Game.player.drawUI(ctx);

	// Draw darken overlay if paused
	if (Game.nextFrame == null) {
		ctx.beginPath();
		ctx.fillStyle = "rgba(0,0,0,0.5)";
		ctx.rect(0,0,800,480);
		ctx.fill();
	}
	
/*
	// Draw mouse test
	ctx.beginPath();
	ctx.fillStyle = (Game.Input.mouse.button ? "#00f" : "#f00");
	ctx.arc(Game.Input.mouse.x,Game.Input.mouse.y,2,0,2*Math.PI,false);
	ctx.fill();
	
	// Draw fps counter
	ctx.fillStyle = "#000";
	ctx.fillText(Math.round(fps)+" fps; "+Game.Input.lastKey+' '+Game.player.y,2,40);
*/
};

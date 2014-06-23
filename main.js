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
	Game.Input.init();
	
	//Game.initWorld();
	Game.currentMode = 0;
	
	Game.startMusic();
	gameLoop();
}

Game.pause = function pause() {
	if (this.nextFrame) {
		window.cancelAnimationFrame(this.nextFrame);
		
		ctx.beginPath();
		ctx.fillStyle = "rgba(0,0,0,0.5)";
		ctx.rect(0,0,800,480);
		ctx.fill();
		
		this.stopMusic();
		
		this.nextFrame = null;
	}
};

Game.resume = function resume() {
	if (!this.nextFrame) {
		this.resumeMusic();
	
		lastFrameTime = null;
		gameLoop(lastFrameTime);
	}
};

function gameLoop(_timestamp) {
	var elapsed;
	if (lastFrameTime) {
		elapsed = _timestamp - lastFrameTime;
		fps = 1000/elapsed;
		onUpdate(Math.min(elapsed,100));
		draw();
	}
	lastFrameTime = _timestamp;

	Game.nextFrame = window.requestAnimationFrame(gameLoop);
};

function onUpdate(elapsed) {
	var i;
	if (Game.currentMode === 1) {
		// Main game play mode
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
	} else {
		// Menu mode
		if (Game.Input.mouse.button) {
			if (Game.currentMode === 2) {
				Game.startMusic();
			}
			Game.initWorld();
			Game.Input.mouse.button = false;
			Game.currentMode = 1;
		}		
	}
};

function draw() {
	var i;
	// Main game mode
	if (Game.currentMode === 1) {
		//ctx.scale(0.5,0.5);
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

		// Draw small keys
		for(i = 0;  i < Game.smallKeys.length;  ++i)
			Game.smallKeys[i].draw(ctx);

		// Draw player
		Game.player.draw(ctx);
		
		// Draw current spell
		if (Game.currentSpell) { Game.currentSpell.draw(ctx); }
		
		/*
		// Debugging for sector boundaries
		ctx.beginPath();
		ctx.strokeStyle = "#f00";
		ctx.lineWidth = 4;
		var lb = Game.actors[0].leftBoundary * 32,
			rb = Game.actors[0].rightBoundary * 32,
			w = rb - lb,
			tb = Game.actors[0].topBoundary * 32,
			bb = Game.actors[0].bottomBoundary * 32,
			h = bb - tb;
		ctx.rect(lb,
				 tb,
				 w,
				 h);
		ctx.stroke();
		*/
		
		ctx.translate(Game.camera.x,Game.camera.y);
		//ctx.scale(2,2);
		
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
		// Debugging for enemy behavior
		ctx.fillStyle = "#000";
		ctx.fillText("gridX: "+Game.actors[0].gridX,2,40);
		ctx.fillText("gridY: "+Game.actors[0].gridY,2,56);
		ctx.fillText("homeSectorX: "+Game.actors[0].homeSectorX,2,72);
		ctx.fillText("homeSectorY: "+Game.actors[0].homeSectorY,2,88);
		ctx.fillText("leftBoundary: "+Game.actors[0].leftBoundary,2,104);
		ctx.fillText("topBoundary: "+Game.actors[0].topBoundary,2,120);
		ctx.fillText("rightBoundary: "+Game.actors[0].rightBoundary,2,136);
		ctx.fillText("bottomBoundary: "+Game.actors[0].bottomBoundary,2,152);
		ctx.fillText("directions: "+Game.actors[0].directionChoices,2,168);
		*/
		
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

	}
	// Menu mode
	else {
		// Draw background
		Game.drawImage(ctx, 'background.png', 0, 0);
		
		switch(Game.currentMode) {
			// Title screen mode
			case 0:
				// Draw title
				Game.drawImage(ctx, 'title.png', 180, 20);
				// Draw prompt
				ctx.fillStyle = "#fff";
				ctx.font = "bold 16pt sans-serif";
				ctx.textAlign = "center";
				ctx.fillText("Use w, a, s, d to move",400,300);
				ctx.fillText("Use the mouse to cast spells",400,320);
				ctx.fillText("Click to begin",400,420);
			break;
			// Death screen mode
			case 2:
				// Draw prompt
				ctx.fillStyle = "#00b";
				ctx.font = "bold 32pt serif";
				ctx.textAlign = "center";
				ctx.fillText("You have died.",400,100);
				
				ctx.fillStyle = "#fff";
				ctx.font = "bold 16pt sans-serif";
				ctx.textAlign = "center";
				ctx.fillText("Click to retry",400,420);
			break;
			// Victory screen mode
			case 3:
				// Draw prompt
				ctx.fillStyle = "#00b";
				ctx.font = "bold 32pt serif";
				ctx.textAlign = "center";
				ctx.fillText("Congratulations!",400,80);
				ctx.fillText("You've won!",400,130);
				
				ctx.fillStyle = "#fff";
				ctx.font = "bold 16pt sans-serif";
				ctx.textAlign = "center";
				ctx.fillText("Click to start over",400,420);
			break;
		}
	}
};

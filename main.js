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
	Game.player = {x: 0, y: 0, casting: 0};


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

	Game.addEnemyBug(320,160);

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

Game.movePlayer = function(elapsed) {
	var SPEED = 0.1 * elapsed,
		SPELL_RANGE = 50,
		CAST_COOLDOWN = 700,			// ms
	
		dir = {x: 0, y: 0},
		keys = Game.Input.keys,
		
		spellX, spellY, spellRange;

	// Cap move speed.
	if(SPEED > 10)
		SPEED = 10;

	// Move player.
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
	Game.player.x += dir.x * SPEED;
	Game.player.y += dir.y * SPEED;

	// Resolve collisions.
	var GRID_SIZE = 32;
	var resolveCollisions = function(x, y, dir) {
		var j = Math.floor(x/GRID_SIZE);
		var i = Math.floor(y/GRID_SIZE);
		var xoff = x - (j+((dir.x+1)/2))*GRID_SIZE;
		var yoff = y - (i+((dir.y+1)/2))*GRID_SIZE;
		var snapx, snapy;
		if(Game.wallGrid[i][j] == null)
			return;

		if(dir.x*xoff <= dir.y*yoff  &&  Game.wallGrid[i][j-dir.x] == null)
			snapx = true;
		else if(dir.x*xoff >= dir.y*yoff  &&  Game.wallGrid[i-dir.y][j] == null)
			snapy = true;
		else
			snapx = snapy = true;

		if(snapx)
			Game.player.x += GRID_SIZE * dir.x * -1  -  xoff;
		if(snapy)
			Game.player.y += GRID_SIZE * dir.y * -1  -  yoff;
	};

	resolveCollisions(Game.player.x, Game.player.y, {x: -1, y: -1});
	resolveCollisions(Game.player.x+GRID_SIZE, Game.player.y, {x: 1, y: -1});
	resolveCollisions(Game.player.x, Game.player.y+GRID_SIZE, {x: -1, y: 1});
	resolveCollisions(Game.player.x+GRID_SIZE, Game.player.y+GRID_SIZE,
	                  {x: 1, y: 1});
	resolveCollisions(Game.player.x, Game.player.y, {x: -1, y: -1});
					  
	// Check whether player is casting
	if (Game.Input.mouse.button && Game.player.casting === 0) {
		Game.player.casting = CAST_COOLDOWN;
		
		spellX = Game.Input.mouse.x - Game.player.x - GRID_SIZE * 0.5;
		spellY = Game.Input.mouse.y - Game.player.y - GRID_SIZE * 0.5;
		spellRange = SPELL_RANGE / Math.sqrt(spellX*spellX+spellY*spellY);
		spellX = Game.player.x + GRID_SIZE * 0.5 + spellRange * spellX;
		spellY = Game.player.y + GRID_SIZE * 0.5 + spellRange * spellY;
		
		Game.castBasicSpell(spellX,spellY);
	} else if (Game.player.casting > 0) {
		Game.player.casting -= elapsed;
		if (Game.player.casting < 0) { Game.player.casting = 0; }
	}
};

function onUpdate(elapsed) {
	var i;

	Game.movePlayer(elapsed);
	
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
	
	// Draw enemies
	for (i = 0; i < Game.actors.length; ++i) {
		Game.actors[i].draw(ctx);
	}
	
	// Draw player
	if (Game.player.casting) {
		Game.drawImage(ctx, 'player_cast.png', Math.round(Game.player.x), Math.round(Game.player.y));
	} else {
		Game.drawImage(ctx, 'player.png', Math.round(Game.player.x), Math.round(Game.player.y));
	}
	
	// Draw current spell
	if (Game.currentSpell) { Game.currentSpell.draw(ctx); }
	
	// Draw mouse test
	ctx.beginPath();
	ctx.fillStyle = (Game.Input.mouse.button ? "#00f" : "#f00");
	ctx.arc(Game.Input.mouse.x,Game.Input.mouse.y,2,0,2*Math.PI,false);
	ctx.fill();
	
	// Draw fps counter
	ctx.fillStyle = "#000";
	ctx.fillText(Math.round(fps)+" fps; "+Game.Input.lastKey+' '+Game.player.y,2,10);
};

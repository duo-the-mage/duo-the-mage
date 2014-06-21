// Load main library
var Game = window.Game || {};

Game.player = (function() {
	function Player() {
		this.x = 750;
		this.y = 430;
		this.health = 10;
		this.casting = 0;
		this.invulnerable = 0;
	};
	
	Player.prototype.update = function update(elapsed) {
		var SPEED = 0.1 * elapsed,
			SPELL_RANGE = 50,
			CAST_COOLDOWN = 700,			// ms
			HIT_COOLDOWN = 2000,			// ms
		
			dir = {x: 0, y: 0},
			keys = Game.Input.keys,
			
			i, a,
			
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
		this.x += dir.x * SPEED;
		this.y += dir.y * SPEED;

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

		resolveCollisions(this.x, this.y, {x: -1, y: -1});
		resolveCollisions(this.x+GRID_SIZE,this.y, {x: 1, y: -1});
		resolveCollisions(this.x, this.y+GRID_SIZE, {x: -1, y: 1});
		resolveCollisions(this.x+GRID_SIZE, this.y+GRID_SIZE,
						  {x: 1, y: 1});
		resolveCollisions(this.x, this.y, {x: -1, y: -1});
				
		// Check for collisions with enemies
		if (this.invulnerable === 0) {
			for (i = 0; i < Game.actors.length; ++i) {
				a = Game.actors[i];
				if ((a.x + a.width > this.x) &&
					(a.x < this.x + GRID_SIZE) &&
					(a.y + a.height > this.y) &&
					(a.y < this.y + GRID_SIZE)) {
					this.invulnerable = HIT_COOLDOWN;
					this.health -= a.attackPower;
					Game.playSound("hurt.wav");
				}
			}
		} else {
			this.invulnerable -= elapsed;
			if (this.invulnerable < 0) { this.invulnerable = 0; }
		}
				
		// Check whether player is casting
		if (Game.Input.mouse.button && this.casting === 0) {
			Game.player.casting = CAST_COOLDOWN;
			
			spellX = Game.Input.mouse.x - this.x - GRID_SIZE * 0.5;
			spellY = Game.Input.mouse.y - this.y - GRID_SIZE * 0.5;
			spellRange = SPELL_RANGE / Math.sqrt(spellX*spellX+spellY*spellY);
			spellX = this.x + GRID_SIZE * 0.5 + spellRange * spellX;
			spellY = this.y + GRID_SIZE * 0.5 + spellRange * spellY;
			
			Game.castBasicSpell(spellX,spellY);
		} else if (this.casting > 0) {
			this.casting -= elapsed;
			if (this.casting < 0) { this.casting = 0; }
		}
	};
	
	Player.prototype.draw = function draw(ctx) {
		if (Math.floor(this.invulnerable / 100) % 2 === 0) {
			if (this.casting) {
				Game.drawImageInWorld(ctx, 'player_cast.png', Math.round(this.x), Math.round(this.y));
			} else {
				Game.drawImageInWorld(ctx, 'player.png', Math.round(this.x), Math.round(this.y));
			}
		}
	};
	
	Player.prototype.drawUI = function drawUI(ctx) {
		// Draw health bar
		for (i = 0; i < 5; ++i) {
			if (this.health > i*2 + 1) {
				Game.drawImage(ctx, 'heart.png', 2 + i * 16, 2);
			} else if (this.health > i*2) {
				Game.drawImage(ctx, 'heart_half.png', 2 + i * 16, 2);
			} else {
				Game.drawImage(ctx, 'heart_empty.png', 2 + i * 16, 2);
			}
		}
	};
	
	return new Player();
}());

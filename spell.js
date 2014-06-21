// Load main library
var Game = window.Game || {};

Game.castBasicSpell = function castBasicSpell(x,y) {
	var BASIC_WINDUP = 500,
		BASIC_WINDUP_R = 10,
		BASIC_EXPLOSION_SIZE = 64,
		BASIC_EXPLOSION_LINGER = 100;
	
	// Set the currently active spell for the game
	Game.currentSpell = {
		update:	function update(elapsed) {
			// Update each tick
			this.countdown -= elapsed;
			if (this.countdown < 0) {
				// Check for enemy collision
			
				if (this.countdown < -BASIC_EXPLOSION_LINGER) {
					// Destroy self
					Game.currentSpell = null;
				}
			}
		},
		draw:	function draw(ctx) {
			// Draw self
			var t;
			if (this.countdown > 0) {
				t = this.countdown / BASIC_WINDUP;
				
				// Draw a circle where the explosion will happen
				ctx.beginPath();
				ctx.fillStyle = "#ff0";
				ctx.arc(this.x,this.y,t*BASIC_WINDUP_R,0,2*Math.PI,false);
				ctx.fill();
			} else {
				Game.drawImage(ctx, 'explosion.png', 
					Math.round(this.x - BASIC_EXPLOSION_SIZE*0.5), 
					Math.round(this.y - BASIC_EXPLOSION_SIZE*0.5));
			}
		},
		x:			x,
		y:			y,
		countdown:	BASIC_WINDUP
	};
};
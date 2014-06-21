// Load main library
var Game = window.Game || {};

Game.camera = (function() {
	function Camera() {
		this.x = 0;
		this.y = 0;
		this.destx = 0;
		this.desty = 0;
	};

	Camera.prototype.update = function(elapsed) {
		var WIDTH = 800,
			HEIGHT = 480;
		if(Game.player.x > this.destx + WIDTH - 32)
			this.destx += WIDTH-32;
		if(Game.player.y > this.desty + HEIGHT - 32)
			this.desty += HEIGHT-32;
		if(Game.player.x < this.destx)
			this.destx += -WIDTH+32;
		if(Game.player.y < this.desty)
			this.desty += -HEIGHT+32;

		var self = this;
		var move = function(x, y) {
			ctx.translate(-x, -y);
			self.x += x;
			self.y += y;
		};

		move((this.destx - this.x) * 0.1,  (this.desty - this.y) * 0.1);
//		move(1,1);
	};

	return new Camera();
}());

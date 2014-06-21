// Load main library
var Game = window.Game || {};

Game.walls = [];

Game.Wall = function Wall() {
	this.x = 0;
	this.y = 0;

	Game.walls.push(this);
};

Game.Wall.prototype.draw = function draw(ctx) {
	Game.drawImage(ctx, 'testwall.png', this.x, this.y);
};
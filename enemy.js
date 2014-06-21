// Load main library
var Game = window.Game || {};

Game.Actors = Game.Actors || [];

Game.createEnemyBug = function createEnemyBug(x,y) {
	Game.Actors.push(new EnemyBug(x,y));
};

function EnemyBug(x,y) {
	this.x = x;
	this.y = y;
};

EnemyBug.prototype.update = function update(elapsed) {

};

EnemyBug.prototype.draw = function draw(ctx) {
	Game.drawImage(ctx, 'enemy.png', Math.round(this.x), Math.round(this.y));
};
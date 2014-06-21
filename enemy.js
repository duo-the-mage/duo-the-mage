// Load main library
var Game = window.Game || {};

Game.actors = Game.actors || [];

Game.addEnemyBug = function addEnemyBug(x,y) {
	Game.actors.push(new EnemyBug(x,y));
};

function EnemyBug(x,y) {
	this.x = x;
	this.y = y;
	this.width = 32;
	this.height = 32;
};

EnemyBug.prototype.destroy = function destroy() {
	this.isDestroyed = true;
};

EnemyBug.prototype.update = function update(elapsed) {

};

EnemyBug.prototype.draw = function draw(ctx) {
	Game.drawImage(ctx, 'enemy.png', Math.round(this.x), Math.round(this.y));
};
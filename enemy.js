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
	this.time = 0;
};

EnemyBug.prototype.destroy = function destroy() {
	this.isDestroyed = true;
};

EnemyBug.prototype.update = function update(elapsed) {
	this.time += elapsed / 200;
};

EnemyBug.prototype.draw = function draw(ctx) {
	var frame = Math.floor(this.time) % 4;
	var filename;
	if(frame == 0  ||  frame == 2)
		filename = 'enemy.png';
	else if(frame == 1)
		filename = 'enemy_1.png';
	else if(frame == 3)
		filename = 'enemy_2.png';
	else
		throw 0;
	Game.drawImage(ctx, filename, Math.round(this.x), Math.round(this.y));
};

// Load main library
var Game = window.Game || {};

Game.actors = Game.actors || [];

Game.addEnemyBat = function addEnemyBat(x,y) {
	Game.actors.push(new EnemyBat(x,y));
};

function EnemyBat(x,y) {
	this.gridX = x;
	this.gridY = y;
	this.x = x * 32;
	this.y = y * 32;
	this.width = 32;
	this.height = 32;
	
	this.homeSectorX = Math.floor((x - 1) / Game.wallGrid.sectorWidth);
	this.homeSectorY = Math.floor((y - 1) / Game.wallGrid.sectorHeight);
	this.leftBoundary = this.homeSectorX * Game.wallGrid.sectorWidth + 1;
	this.topBoundary = this.homeSectorY * Game.wallGrid.sectorHeight + 1;
	this.rightBoundary = (this.homeSectorX+1) * Game.wallGrid.sectorWidth - 1;
	this.bottomBoundary = (this.homeSectorY+1) * Game.wallGrid.sectorHeight - 1;
	
	this.attackPower = 0;

	this.time = 0;
};

EnemyBat.prototype.destroy = function destroy() {
	this.isDestroyed = true;
};

EnemyBat.prototype.update = function update(elapsed) {
	if (this.homeSectorX !== Game.player.sectorX ||
		this.homeSectorY !== Game.player.sectorY) { return; }

	this.time += elapsed / 100;
};

EnemyBat.prototype.draw = function draw(ctx) {
	var frame = Math.floor(this.time) % 4;
	
	Game.drawImage(ctx, "bat.png", 
		frame * 32,				// Slice x
		0,					// Slice y
		32,					// Slice width
		32,					// Slice height
		Math.round(this.x),	// Draw x
		Math.round(this.y),	// Draw y
		32,					// Draw width
		32					// Draw height
	);
};

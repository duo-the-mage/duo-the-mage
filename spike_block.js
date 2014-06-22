// Load main library
var Game = window.Game || {};

Game.actors = Game.actors || [];

Game.addSpikeBlock = function addSpikeBlock(x,y) {
	Game.actors.push(new SpikeBlock(x,y));
};

function SpikeBlock(x,y) {
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
	
	this.time = 0;
	this.attackPower = 1;
};

SpikeBlock.prototype.destroy = function destroy() {
	//this.isDestroyed = true;
};

SpikeBlock.prototype.update = function update(elapsed) {
	if (this.homeSectorX !== Game.player.sectorX ||
		this.homeSectorY !== Game.player.sectorY) { return; }

	this.time += elapsed;
};

SpikeBlock.prototype.draw = function draw(ctx) {
	Game.drawImage(ctx, "spike_block.png", 
		Math.round(this.x),	// Draw x
		Math.round(this.y)	// Draw y
	);
};

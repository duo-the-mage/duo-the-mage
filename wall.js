// Load main library
var Game = window.Game || {};

Game.walls = [];
Game.wallGrid = (function() {
	var result = [],
		i, j;
	for(i = 0;  i < 29;  ++i) {
		result.push([]);
		for(j = 0;  j < 49;  ++j)
			result[i].push(null);
	}
	return result;
}());

Game.Wall = function Wall(j, i, type) {
	this.x = j*32;
	this.y = i*32;
	this.type = type;
};

Game.addWall = function addWall(j, i) {
	var w = new Game.Wall(j, i, 'wall');
	if(Game.wallGrid[i][j] !== null)
		throw 0;
	Game.walls.push(w);
	Game.wallGrid[i][j] = w;
};

Game.addLockedDoor = function(j, i) {
	var w = new Game.Wall(j, i, 'locked_door');
	if(Game.wallGrid[i][j] !== null)
		throw 0;
	Game.walls.push(w);
	Game.wallGrid[i][j] = w;
};

Game.Wall.prototype.draw = function draw(ctx) {
	if(this.type === 'wall')
		Game.drawImageInWorld(ctx, 'testwall.png', this.x, this.y);
	else if(this.type === 'locked_door')
		Game.drawImageInWorld(ctx, 'testlockeddoor.png', this.x, this.y);
	else
		throw 0;
};

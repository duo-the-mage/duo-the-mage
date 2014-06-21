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

Game.Wall = function Wall(j, i) {
	this.x = j*32;
	this.y = i*32;
};

Game.addWall = function addWall(j, i) {
	var w = new Game.Wall(j, i);
	Game.walls.push(w);
	Game.wallGrid[i][j] = w;
};

Game.Wall.prototype.draw = function draw(ctx) {
	Game.drawImageInWorld(ctx, 'testwall.png', this.x, this.y);
};

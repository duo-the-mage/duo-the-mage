// Load main library
var Game = window.Game || {};

Game.clearWorld = function clearWorld() {
	// Clear the wall grid
	var i,j;
	for (i = 0; i < Game.wallGrid.length; ++i) {
		for (j = 0; j < Game.wallGrid[i].length; ++j) {
			Game.wallGrid[i][j] = null;
		}
	}
	// Clear the wall list
	Game.walls.splice(0);
	// Clear the actor list
	Game.actors.splice(0);
	// Clear the current spell
	Game.currentSpell = null;
};

Game.initWorld = function initWorld() {
	var i;
	// World boundaries
	for (i = 0; i < Game.wallGrid.width; ++i) {
		Game.addWall(i, 0);
		Game.addWall(i, Game.wallGrid.height - 1);
	}
	for (i = 1; i < Game.wallGrid.height - 1; ++i) {
		Game.addWall(0, i);
		Game.addWall(Game.wallGrid.width - 1, i);
	}
	// Sector boundaries
	for (i = 1; i < Game.wallGrid.width - 1; ++i) {
		Game.addWall(i, 14);
	}
	for (i = 1; i < Game.wallGrid.height - 1; ++i) {
		if (i === 14) continue;
		Game.addWall(24, i);
	}
	// Pathways to other sectors
	Game.removeWall(24,6);
	Game.removeWall(24,7);
	Game.removeWall(24,8);
	Game.removeWall(35,14);
	Game.removeWall(36,14);
	Game.removeWall(37,14);
	Game.removeWall(24,20);
	Game.removeWall(24,21);
	Game.removeWall(24,22);
	
	// Top left sector
	Game.addWall(12,2);
	Game.addWall(14,2);
	Game.addWall(14,4);
	Game.addWall(12,4);
	Game.addWall(11,5);
	Game.addWall(15,5);
	Game.addLockedDoor(10,4);
//	Game.addWall(11,4);

	Game.addWall(8,8);
	Game.addWall(15,9);
	Game.addWall(14,13);
	Game.addWall(7,12);
	Game.addEnemyBug(8,12);
	Game.addEnemyBug(8,12);
	Game.addEnemyBug(8,12);
	Game.addEnemyBug(8,12);
	Game.addEnemyBug(8,12);
	Game.addEnemyBug(8,12);
	Game.addEnemyBug(8,12);
	Game.addEnemyBug(8,12);
	Game.addEnemyBug(8,12);
	Game.addEnemyBug(8,12);
};
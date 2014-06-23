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
	// Clear the small key list
	Game.smallKeys.splice(0);
	// Clear the current spell
	Game.currentSpell = null;
	// Reset the player
	Game.player.reset();
};

Game.world1 =	"wwwwwwwwwwwwwwwwwwwwwwwwwwwwwwwwwwwwwwwwwwwwwwwwwwwwwwwwwwwwwwwwwwwwwwwwwwwwwwwwwwwwwwwwwwwwwwwww"+
				"w.w...................w.w.......................................................................w"+
				"www...................www.......................................................................w"+
				"w......www..............w..wwwwwwww...wwwwwwww..................................................w"+
				"w......w.w..............w..w........B........w..wwwwwwwwwww...wwwwwwwwwww...wwwwwwwwwwwwwwwww...w"+
				"w......www..........w...w..w.................w..w.........wwLww.........w...w...............w...w"+
				"w...................w.........w....www....w.....w.......................w...w.B...........B.w...w"+
				"w..P................w.........w.B..w.w..B.w.....w..F.................F..w...w.......k.......w...w"+
				"w...................w.........w....www....w.....w.......................w...w...............w...w"+
				"w......www..........w...w..w.................w..w.......................w...w...www...www...w...w"+
				"w......w.w..............w..w........B........w..w.www...............www.w...w...w.w...w.w...w...w"+
				"w......www..............w..wwwwwwww...wwwwwwww..w.w.w...............w.w.w...wwwwwww...wwwwwww...w"+
				"www...................www.......................w.www...............www.w.B...................B.w"+
				"w.w...................w.w.......................w.......................w.......................w"+
				"wwwwwwwwwwwwwwwwwwwwwwwwwwwwwwwwwwwwwwwwwwwwwwwwwwwwwwwwwww...wwwwwwwwwwwwwwwwwwwwwwwwwwwwwwwwwww"+
				"w.......................w...........S.......S...w.......................w.......................w"+
				"w.......................w.......F...............w.......................w..B.................B..w"+
				"w.................................................B...................B.w.......sss...sss.......w"+
				"w.......................................................................w.......sss...sss.......w"+
				"w..wwwwwwwww.wwwwwwwwwwww.......F...............w.........wwwww.........w.......sss...sss.......w"+
				"wF......................w...............S.......w.........w...w.................................w"+
				"wwwwwwwwwwwwwwwwwwwwwww.wwwwwwwwwwwwwwwwwwwwwwwww.........w...w.....................F...........w"+
				"wS......................w....................wkkw.........w...w.................................w"+
				"wwwwwwwwwwww.wwwwwwwwwwww...B..B.....B....B..w..w.........wwwww.........w.......sss...sss.......w"+
				"w....................Fwww......B......B.B....ww.w.......................w.......sss...sss.......w"+
				"w.wwwwwwwwwwwwwwwwwwwww............B........B...w.......F.......F.......w.......sss...sss.......w"+
				"w....................S..w......B.....B...B...wwLw.........wwLww.........w..B.................B..w"+
				"w....................S..w....................wk.L.........wwLww.........w.......................w"+
				"wwwwwwwwwwwwwwwwwwwwwwwwwwwwwwwwwwwwwwwwwwwwwwwwwwwwwwwwwww...wwwwwwwwwwwLwwwwwwwww...wwwwwwwwwww"+
				"w.......................w.......................w.........w...w.........w....w.............w....w"+
				"w.......................w.......................w.F.......w...w.......F.wkw..w.............w....w"+
				"w.......................w.......................w...ss....w...w....ss...www.ww.............ww...w"+
				"w.......................w.......................w...ss.............ss...w...wS.............Sw...w"+
				"w.......................wwwww...................w.......................w...ww.............ww...w"+
				"w.........................w.w...........................................w....w.....sss.....w....w"+
				"w.........................L.L...........................................w....w.....sss.....w....w"+
				"w.........................w.w........................ww...........ww....w....w.....sss.....w....w"+
				"w.......................wwwww...................wwwwwwS...........Swwwwww...ww.............ww...w"+
				"w.......................w.......................w....ww...........ww....w.k.wS.............Sw...w"+
				"w.......................w.......................w.......................w...ww.............ww...w"+
				"w.......................w.......................w.F..ss...........ss..F.w....w.............w....w"+
				"w.......................w.......................w.......................w....w.............w....w"+
				"wwwwwwwwwww...wwwwwwwwwwwwwwwwwwwww...wwwwwwwwwwwwwwwwwwwww...wwwwwwwwwww....wwwwww...wwwwwwwwwww"+
				"w.......................w.......................wS........w...w........Sw.........w...w.........w"+
				"w.......................w.......................w........B.....B........wLwwwwwwwww...wwwwwwwwwww"+
				"w.......................w..F.................F..w...wwww...www...wwww...w......................Sw"+
				"w.......................w.........wwwww.........w......w...w.w...w......w......................Sw"+
				"w.......................w......................Sw..B...w...www...w...B..wwww..wwwwwwwwwwwwwwwwwww"+
				"w.......................w...........w...........w......w.B..w..B.w......w..w..wSw....wSw.....w..w"+
				"w.......................wwwwww.....www.....wwwwww...B..SwwwwwwwwwS..B...wwww......ss.........wwww"+
				"w.......................w...........w...........w......w.........w......w.........ss............w"+
				"w.......................wS......................w..B...w....k....w...B..w.........ss............w"+
				"w.......................w.........wwwww.........w......w.........w......w.........ss..........k.w"+
				"w.......................w..F.................F..w...wwww.B.www.B.wwww...w.........ss............w"+
				"w.......................wwwwwww.....k......wwwwww..........w.w..........wwww......ss.........wwww"+
				"w.......................w.....wSwwwwwwwwwwSw....wS.........w.w.........Sw..w..wSw....wSw.....w..w"+
				"wwwwwwwwwww...wwwwwwwwwwwwwwwwwwwwwwwwwwwwwwwwwwwwwwwwwwwwwwwwwwwwwwwwwwwwwwwwwwwwwwwwwwwwwwwwwww";

Game.initWorld = function initWorld() {
	var i, j, n;
	for (j = 0; j < Game.wallGrid.height; ++j) {
		for (i = 0; i < Game.wallGrid.width; ++i) {
			n = j*Game.wallGrid.width + i;
			if (Game.world1[n] === 'w') { Game.addWall(i,j); }
			if (Game.world1[n] === 'L') { Game.addLockedDoor(i,j); }
			if (Game.world1[n] === 'B') { Game.addEnemyBug(i,j); }
			if (Game.world1[n] === 'F') { Game.addEnemyBat(i,j); }
			if (Game.world1[n] === 'S') { Game.addSpikeBlock(i,j); }
			if (Game.world1[n] === 's') { Game.addSpikes(i,j); }
			if (Game.world1[n] === 'P') {
				Game.player.x = 32*i;
				Game.player.y = 32*j;
			}
			if (Game.world1[n] === 'k') { Game.addSmallKey(i,j); }
		}
	}
};

// Load main library
var Game = window.Game || {};


(function() {


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
  Game.other_spell = null;
  // Reset the player
  Game.player.reset();
};

Game.world1 =  "wwwwwwwwwwwwwwwwwwwwwwwwwwwwwwwwwwwwwwwwwwwwwwwwwwwwwwwwwwwwwwwwwwwwwwwwwwwwwwwwwwwwwwwwwwwwwwwww"+
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
               "w.......................wS......................w.......................w..........wSw..........w"+
               "w.......................ww............wwwwwwww..w.......................w.......................w"+
               "w.....................................wS.....w....B...................B.w.......................w"+
               "w.....................................wS.....w..........................w..........w.w..........w"+
               "w..wwwwwwwww.wwwwwwwwwwwww............wwwwwwww..w.........ww.ww.........wwwwwwwwwwwwwww.........w"+
               "wF......................wS......................w.........w...w...............s.......ww.......ww"+
               "wwwwwwwwwwwwwwwwwwwwwww.wwwwwwwwwwwwwwwwwwwwwwwww...........F.................s.......w........Sw"+
               "wS......................w.>...w...w.w...wBw...Bkw.........w...w...............s.......ww.......ww"+
               "wwwwwwwwwwww.wwwwwwwwwwww.w.B..B.....B....B.....w.........w.w.w.........wwwwwwwwwww...w.........w"+
               "w....................Fwww.ww...B.B..B.B.B......Bw.......................w.........w...w.........w"+
               "w.wwwwwwwwwwwwwwwwwwwww...ww.......B........B...w.......................w.........wsssw.........w"+
               "w....................S..w.w....B.....B...B......w.........wwLww.........w.........w...w.........w"+
               "w....................S..w.>.B...w.....w.....w...>.........wwLww.........<.........w...w.........w"+
               "wwwwwwwwwwwwwwwwwwwwwwwwwwwwwwwwwwwwwwwwwwwwwwwwwwwwwwwwwww...wwwwwwwwwww....wwwwww...wwwwwwwwwww"+
               "wS...................Sw.w.......................w.........w...w.........w....w.............w....w"+
               "w.......B.....B.......www.......................w.F.......w...w.......F.w....w.............w....w"+
               "w....B..........B...B...w.......sss...sss.......w...ss....w...w....ss...w...ww.............ww...w"+
               "w..........B......B.....w.......sss...sss.......w...ss.............ss...w...wS.............Sw...w"+
               "w.......B.......B.....w.wwwww...sss...sss.......w.......................w...ww.............ww...w"+
               "w.....................w...w.w......sss..................................w....w.....sss.....w....w"+
               "w..wwwwwwwwwwwwwwwwwwww...L.L......sss..................................w....w.....sss.....w....w"+
               "w.....................w...w.w......sss...............ww...........ww....w....w.....sss.....w....w"+
               "w......B...........B..wwwwwww...sss...sss.......wwwwwwS...........Swwwwww...ww.............ww...w"+
               "w..........B....B.......w.......sss...sss.......w....ww...........ww....w...wS.............Sw...w"+
               "w.......B..........B....w.......sss...sss.......w.......................w...ww.............ww...w"+
               "w.....B.......B.......www.......................w....ss...........ss....w....w.............w....w"+
               "wS...................Sw.w.......................w.......................w....w.............w....w"+
               "wwwwwwwwwww...wwwwwwwwwwwwwwwwwwwww...wwwwwwwwwwwwwwwwwwwww...wwwwwwwwwww....wwwwww...wwwwwwwwwww"+
               "w.......................w.......................wS........w...w........Sw.........w...w.........w"+
               "w.......................w.......................w........B.....B........w..wwwwwwww...wwwwwwwwwww"+
               "w..wwwwwwwwwwwwwwwwwww..w..F.................F..w...wwww...www...wwww...w......................Sw"+
               "w..........SwS..........w.........wwwww.........w......w...w.w...w......w......................Sw"+
               "wsss...sss..F..sss...sssw......................Sw..B...w...www...w...B..wwww..wwwwwwwwwwwwwwwwwww"+
               "wwss.B.sss..B..sss.B.ssww...........w...........w......w....w....w......w..w..wSw....wSw.....w..w"+
               "wS...B..B...B...B..B...Swwwwww.....www.....wwwwww...B..SwwwwwwwwwS..B...wwww......ss.........wwww"+
               "ww..sss.B..sss..B.sss..ww...........w...........w......w.........w......w.........ss............w"+
               "w...sss.F..sss..F.sss...wS......................w..B...w....k....w...B..w.........ss............w"+
               "w..........SwS..........w.........wwwww.........w......w.........w......w.........ss..........k.w"+
               "w..wwwwwwwwwwwwwwwwwww..w..F.................F..w...wwww.B.www.B.wwww...w.........ss............w"+
               "w.......................wwwwwww.....k......wwwwww..........w.w..........wwww......ss.........wwww"+
               "w.......................w.....wSwwwwwwwwwwSw....wS.........w.w.........Sw..w..wSw....wSw.....w..w"+
               "wwwwwwwwwww...wwwwwwwwwwwwwwwwwwwwwwwwwwwwwwwwwwwwwwwwwwwwwwwwwwwwwwwwwwwwwwwwwwwwwwwwwwwwwwwwwww";

let canvas2 = null;
let ctx2;

Game.initWorld = function initWorld(random) {
  var i, j, n;
  Game.clearWorld();
  Game.other_movement_buffer = [];
  Game.movement_buffer = [];
  Game.unique_id = 0;
  for (j = 0; j < Game.wallGrid.height; ++j) {
    for (i = 0; i < Game.wallGrid.width; ++i) {
      n = j*Game.wallGrid.width + i;
      if (Game.world1[n] === 'w') { Game.addWall(i,j); }
      if (Game.world1[n] === 'L') { Game.addLockedDoor(i,j); }
      if (Game.world1[n] === 'B') { Game.addEnemyBug(i,j,Game.make_random(random)); }
      if (Game.world1[n] === 'F') { Game.addEnemyBat(i,j); }
      if (Game.world1[n] === 'S') { Game.addSpikeBlock(i,j); }
      if (Game.world1[n] === 's') { Game.addSpikes(i,j); }
      if (Game.world1[n] === 'P') {
        Game.player.x = 32*i;
        Game.player.y = 32*j;
        Game.player.setSpawnPoint();

        Game.other_player.x = 32*i;
        Game.other_player.y = 32*j;
      }
      if (Game.world1[n] === 'k') { Game.addSmallKey(i,j); }
      if (Game.world1[n] === '>') { Game.addOneWayDoorR(i,j); }
      if (Game.world1[n] === '<') { Game.addOneWayDoorL(i,j); }
    }
  }
  Game.totalDeaths = 0;

  if(canvas2 === null) {
    canvas2 = document.createElement('canvas');
    canvas2.width = Game.wallGrid[0].length * 32;
    canvas2.height = Game.wallGrid.length * 32;
    ctx2 = canvas2.getContext('2d');
  }
  Game.redraw_walls();
};

Game.redraw_walls = function() {
  ctx2.clearRect(0, 0, canvas2.width, canvas2.height);
  for(let i=0; i<Game.walls.length; ++i)
    Game.walls[i].draw(ctx2);
};

Game.draw_walls = function(ctx) {
  ctx.drawImage(canvas2, 0, 0);
};


}());

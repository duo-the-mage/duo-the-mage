// Load main library
var Game = window.Game || {};

Game.actors = Game.actors || [];

(function() {

  var normalize = function(v) {
    var len = Math.sqrt(v.x*v.x + v.y*v.y);
    if(len == 0.0) {
      v.x = -1;
      v.y = 0;
    } else {
      v.x /= len;
      v.y /= len;
    }
  };

  var GRID_SIZE = 32;
  var SPEED = 0.2;
  var LENGTH = 100;

  var Laser = function(id, x, y, tx, ty) {
    var j = Math.floor(x/GRID_SIZE);
    var i = Math.floor(y/GRID_SIZE);

    this.gridX = j;
    this.gridY = i;
    this.x = x;
    this.y = y;
    this.width = 0;
    this.height = 0;

    this.homeSectorX = Math.floor((j - 1) / Game.wallGrid.sectorWidth);
    this.homeSectorY = Math.floor((i - 1) / Game.wallGrid.sectorHeight);
    this.leftBoundary = this.homeSectorX * Game.wallGrid.sectorWidth - 4;
    this.topBoundary = this.homeSectorY * Game.wallGrid.sectorHeight - 4;
    this.rightBoundary = (this.homeSectorX+1) * Game.wallGrid.sectorWidth + 5;
    this.bottomBoundary = (this.homeSectorY+1) * Game.wallGrid.sectorHeight + 5;

    this.length = 0;
    this.willBeDestroyed = false;
    this.time = 0;
    this.attackPower = 1;

    this.unique_id = id;

    this.dir = {x: tx - x, y: ty - y};
    normalize(this.dir);
  };

  Laser.prototype.destroy = function destroy() {
    this.willBeDestroyed = true;
  };

  Laser.prototype.update = function update(elapsed) {
    var SECTOR_WIDTH = Game.wallGrid.sectorWidth * GRID_SIZE,
      SECTOR_HEIGHT = Game.wallGrid.sectorHeight * GRID_SIZE;

    // Find which sector the laser is in
    const sectorX = Math.floor(this.x / SECTOR_WIDTH);
    const sectorY = Math.floor(this.y / SECTOR_HEIGHT);

    // Destroy upon hitting edge of screen
    if (     this.homeSectorX !== sectorX
          || this.homeSectorY !== sectorY )
      this.willBeDestroyed = true;

    this.time += elapsed;

    if(this.willBeDestroyed) {
      this.length -= elapsed * SPEED;
      if(this.length <= 0)
        this.isDestroyed = true;
      return;
    }

    // Destroy when hitting wall
    var j = Math.floor(this.x / GRID_SIZE);
    var i = Math.floor(this.y / GRID_SIZE);
    if(Game.wallGrid[i][j] !== null) {
      this.destroy();
      return;
    }

    this.x += elapsed * this.dir.x * SPEED;
    this.y += elapsed * this.dir.y * SPEED;
    this.length += elapsed * SPEED;
    this.length = Math.min(this.length, LENGTH);
  };

  Laser.prototype.draw = function draw(ctx) {
    ctx.beginPath();
    ctx.moveTo(this.x, this.y);
    ctx.lineTo(this.x - this.dir.x*this.length, this.y - this.dir.y*this.length);
    ctx.lineCap = 'round';
    ctx.lineWidth = 3;
    ctx.strokeStyle = '#F00';
    ctx.stroke();
    ctx.strokeStyle = '#FCC';
    ctx.lineWidth = 1;
    ctx.stroke();
  };

  Game.addLaser = function(id, x, y, tx, ty) {
    // Play sound if on-screen
    if(Game.onscreen_xy(x, y))
      Game.playSound("laser.wav");
    Game.actors.push(new Laser(id, x, y, tx, ty));
  };

}());

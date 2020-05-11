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

  this.unique_id = Game.unique_id++;

  this.time = 0;
  this.lastAttack = 0;  //The value of this.time when most recently attacking
};

EnemyBat.prototype.destroy = function destroy() {
  this.isDestroyed = true;
  if(Game.onscreen_xy(this.x, this.y))
    Game.playSound("enemy_die.wav");
};

EnemyBat.prototype.update = function update(elapsed) {
  var GRID_SIZE = 32;

  const on_player_screen = (
      this.homeSectorX === Game.player.sectorX &&
      this.homeSectorY === Game.player.sectorY
    );
  const on_other_player_screen = (
      this.homeSectorX === Game.other_player.sectorX &&
      this.homeSectorY === Game.other_player.sectorY
    );
  if(!on_player_screen && !on_other_player_screen)
    return;

  // Possibly fire laser
  if(Game.hosting) {
    if(Math.floor(this.time/20) !== this.lastAttack) {
      this.lastAttack = Math.floor(this.time/20);

      // Choose a target
      let player = Game.player;
      if(!on_player_screen  ||  Math.random() < 0.5)
        player = Game.other_player;
      if(!on_other_player_screen)
        player = Game.player;

      // Fire laser
      const laser_id = Game.unique_id++;
      const px = player.x+GRID_SIZE/2;
      const py = player.y+GRID_SIZE/2;
      Game.addLaser(laser_id, this.x + GRID_SIZE/2, this.y + GRID_SIZE/2 + 1, px, py);
      Game.multiplayer_send({
        type: 'fire laser',
        bat_id: this.unique_id,
        laser_id: laser_id,
        tx: px,
        ty: py,
      });
    }
  }

  this.time += elapsed / 100;
};

EnemyBat.prototype.draw = function draw(ctx) {
  var frame = Math.floor(this.time) % 4;

  Game.drawImage(ctx, "bat.png",
    frame * 32,        // Slice x
    0,          // Slice y
    32,          // Slice width
    32,          // Slice height
    Math.round(this.x),  // Draw x
    Math.round(this.y),  // Draw y
    32,          // Draw width
    32          // Draw height
  );
};

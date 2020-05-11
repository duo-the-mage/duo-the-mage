// Load main library
var Game = window.Game || {};

Game.other_player = (function() {
  var GRID_SIZE = 32,
    SPELL_RANGE = 50,
    MAX_HP = 10;

  function Player() {
    this.x = 32*10;
    this.y = 32*2;

    this.spawnX = this.x;
    this.spawnY = this.y;

    this.sectorX = 0;
    this.sectorY = 0;

    this.reset();
  };

  Player.prototype.reset = function reset() {
    this.health = MAX_HP;
    this.invulnerable = 0;
    this.dead = 0;
    this.smallKeys = 0;
    this.victory = 0;
  };

  Player.prototype.setSpawnPoint = function() {
    this.spawnX = this.x;
    this.spawnY = this.y;
  };
  Player.prototype.respawn = function() {
    this.x = this.spawnX;
    this.y = this.spawnY;
    this.health = MAX_HP;
    this.invulnerable = 0;
    this.dead = 0;
  };

  Player.prototype.update = function update(elapsed) {
    var SECTOR_WIDTH = Game.wallGrid.sectorWidth * GRID_SIZE,
      SECTOR_HEIGHT = Game.wallGrid.sectorHeight * GRID_SIZE,
      myright   = this.x + GRID_SIZE,
      mybottom  = this.y + GRID_SIZE,
      self = this;

    if (this.dead === 0 && !this.victory) {
      var SPEED = 0.1,
        HIT_COOLDOWN = 2000,      // ms
        HIT_GRACE = 2;

      const move = (dir_x, dir_y, amount) => {
        let diag = 1;
        if(dir_x != 0  &&  dir_y != 0)
          diag = 0.707;
        this.x += dir_x * SPEED * amount * diag;
        this.y += dir_y * SPEED * amount * diag;
      };
      let t = elapsed;
      while(t > 0  &&  Game.other_movement_buffer.length > 0) {
        const action = Game.other_movement_buffer[0];
        if(action.type === 'relative') {
          if(action.elapsed > t) {
            action.elapsed -= t;
            move(action.dir_x, action.dir_y, t);
            t = 0;
          } else {
            Game.other_movement_buffer.splice(0, 1);
            t -= action.elapsed;
            move(action.dir_x, action.dir_y, action.elapsed);
          }
        } else if(action.type === 'teleport') {
          this.x = action.x;
          this.y = action.y;
          Game.other_movement_buffer.splice(0, 1);
        }
      }
  
      // Resolve collisions.
      var resolveCollisions = (x, y, dir) => {
        var j = Math.floor(x/GRID_SIZE);
        var i = Math.floor(y/GRID_SIZE);
        var xoff = x - (j+((dir.x+1)/2))*GRID_SIZE;
        var yoff = y - (i+((dir.y+1)/2))*GRID_SIZE;
        var snapx, snapy;
        if(Game.no_wall(j, i))
          return;
        
        // Unlock locked doors
        if(        Game.wallGrid[i][j].type === 'locked_door'
                && self.smallKeys > 0
                && Game.hosting
                ) {
          Game.multiplayer_send({type: 'change key count', amount: -1});
          --self.smallKeys;
          Game.multiplayer_send({type: 'unlock', x: j, y: i});
          Game.removeWall(j, i);
          if(Game.onscreen_ji(j, i))
            Game.playSound("unlock.wav");
          return;
        }
  
        if(dir.x*xoff <= dir.y*yoff  &&  Game.no_wall(j-dir.x, i))
          snapx = true;
        else if(dir.x*xoff >= dir.y*yoff  &&  Game.no_wall(j, i-dir.y))
          snapy = true;
        else
          snapx = snapy = true;
  
        if(snapx)
          this.x += GRID_SIZE * dir.x * -1  -  xoff;
        if(snapy)
          this.y += GRID_SIZE * dir.y * -1  -  yoff;
      };
  
      resolveCollisions(this.x, this.y, {x: -1, y: -1});
      resolveCollisions(this.x+GRID_SIZE,this.y, {x: 1, y: -1});
      resolveCollisions(this.x, this.y+GRID_SIZE, {x: -1, y: 1});
      resolveCollisions(this.x+GRID_SIZE, this.y+GRID_SIZE, {x: 1, y: 1});
      resolveCollisions(this.x, this.y, {x: -1, y: -1});
  
      // Find which sector the player is in
      if (this.x > (this.sectorX + 1) * SECTOR_WIDTH) {
        this.sectorX += 1;
      } else if(this.x < this.sectorX * SECTOR_WIDTH) {
        this.sectorX -= 1;
      }
      if (this.y > (this.sectorY + 1) * SECTOR_HEIGHT) {
        this.sectorY += 1;
      } else if(this.y < this.sectorY * SECTOR_HEIGHT) {
        this.sectorY -= 1;
      }

      this.invulnerable -= elapsed;
      if (this.invulnerable < 0) { this.invulnerable = 0; }

      // Check for collisions with keys
      for(i = Game.smallKeys.length-1;  i >= 0;  --i) {
        if(        Game.smallKeys[i].x < myright
                && Game.smallKeys[i].x > this.x
                && Game.smallKeys[i].y < mybottom
                && Game.smallKeys[i].y > this.y
                && Game.hosting
                ) {
          // Play sound if on-screen
          if (     this.sectorX === Game.player.sectorX
                && this.sectorY === Game.player.sectorY )
            Game.playSound("key.wav");
          Game.multiplayer_send({type: 'destroy key in world', id: Game.smallKeys[i].unique_id});
          Game.smallKeys.splice(i, 1);
          Game.multiplayer_send({type: 'change key count', amount: 1});
          ++this.smallKeys;
        }
      }
    }
    else if (this.dead > 0) {
      this.dead += elapsed;
    }
    else {
      this.victory += elapsed;
    }
  };

  Player.prototype.draw = function draw(ctx) {
    var t = 0, i, dx, dy;

    if (this.dead === 0) {
      if (this.victory > 0) {
        Game.drawImageInWorld(ctx, 'player.png', Math.round(this.x), Math.round(this.y + this.victory * 0.05));
      } else if (Math.floor(this.invulnerable / 100) % 2 === 0) {
        if (Game.currentSpell  ||  Game.other_spell) {
          Game.drawImageInWorld(ctx, 'player_cast.png', Math.round(this.x), Math.round(this.y));
        } else {
          Game.drawImageInWorld(ctx, 'player.png', Math.round(this.x), Math.round(this.y));
        }
        if(Game.hosting)
          Game.drawImageInWorld(ctx, 'player_2.png', Math.round(this.x)+11, Math.round(this.y)+16);
      }
    } else if(Game.onscreen_xy(this.x, this.y)) {
      for (i = 0; i < 8; ++i) {
        if (i >= 1 && i <= 3) { dx = this.dead * 0.1; }
        else if (i >= 5 && i <= 7) { dx = this.dead * -0.1; }
        else { dx = 0; }
        if (i < 2 || i >= 7) { dy = this.dead * -0.1; }
        else if (i >= 3 && i <= 5) { dy = this.dead * 0.1; }
        else { dy = 0; }
        if (dx && dy) {
          dx *= 0.707;
          dy *= 0.707;
        }

        ctx.beginPath();
        ctx.fillStyle = "#fff";
        ctx.arc(this.x + 16 + dx,this.y + 16 + dy,Math.floor(this.dead / 100) % 2 === 0 ? 8 : 16,0,2*Math.PI,false);
        ctx.fill();
      }
    }
  };

/*
  Player.prototype.drawUI = function drawUI(ctx) {
    var i;
    // Draw health bar
    for (i = 0; i < 5; ++i) {
      if (this.health > i*2 + 1) {
        Game.drawImage(ctx, 'heart.png', 2 + i * 16, 2);
      } else if (this.health > i*2) {
        Game.drawImage(ctx, 'heart_half.png', 2 + i * 16, 2);
      } else {
        Game.drawImage(ctx, 'heart_empty.png', 2 + i * 16, 2);
      }
    }
    for (i = 0; i < this.smallKeys; ++i) {
      Game.drawImage(ctx, 'small_key.png', 90 + i * 32, 0);
    }
  };
*/

  Player.prototype.cast_spell = function(spellX, spellY) {
    Game.other_spell = null;

    if(this.dead === 0  &&  !this.victory) {
      Game.castOtherSpell(spellX, spellY);
    }
  };

  return new Player();
}());

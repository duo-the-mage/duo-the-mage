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
      if(action.elapsed > t) {
        action.elapsed -= t;
        move(action.dir_x, action.dir_y, t);
        t = 0;
      } else {
        Game.other_movement_buffer.splice(0, 1);
        t -= action.elapsed;
        move(action.dir_x, action.dir_y, action.elapsed);
      }
    }
  };

  Player.prototype.draw = function draw(ctx) {
    var t = 0, i, dx, dy;

    if (this.dead === 0) {
      if (this.victory > 0) {
        Game.drawImageInWorld(ctx, 'player.png', Math.round(this.x), Math.round(this.y + this.victory * 0.05));
      } else if (Math.floor(this.invulnerable / 100) % 2 === 0) {
        if (Game.currentSpell) {
          Game.drawImageInWorld(ctx, 'player_cast.png', Math.round(this.x), Math.round(this.y));
        } else {
          Game.drawImageInWorld(ctx, 'player.png', Math.round(this.x), Math.round(this.y));
        }
      }
    } else {
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

  Player.prototype.onClick = function() {
    var spellX, spellY, spellRange;
    if(this.dead === 0  &&  !this.victory  &&  Game.currentSpell == null) {
      spellX = Game.camera.x+Game.Input.mouse.x - this.x - GRID_SIZE*0.5;
      spellY = Game.camera.y+Game.Input.mouse.y - this.y - GRID_SIZE*0.5;
      spellRange = SPELL_RANGE / Math.sqrt(spellX*spellX+spellY*spellY);
      spellX = this.x + GRID_SIZE * 0.5 + spellRange * spellX;
      spellY = this.y + GRID_SIZE * 0.5 + spellRange * spellY;

      Game.castBasicSpell(spellX, spellY);
    }

    Game.multiplayer_sync();
  };

  return new Player();
}());
// Load main library
var Game = window.Game || {};

Game.castOtherSpell = function(x,y) {
  var BASIC_WINDUP = 500,
    BASIC_WINDUP_R = 10,
    BASIC_EXPLOSION_SIZE = 64,
    BASIC_EXPLOSION_LINGER = 400,
    BASIC_EXPLOSION_FRAMES = 8;

  // Set the currently active spell for the game
  Game.other_spell = {
    update:  function update(elapsed) {
      var a;

      // Play sound only on transition
      if (this.countdown >= 0 && this.countdown - elapsed < 0) {
        // Play sound only when on same screen
        if(Game.onscreen_xy(x,y))
          Game.playSound("explosion.wav");
      }
      // Update each tick
      this.countdown -= elapsed;
      if (this.countdown < 0) {
        if (this.countdown < -BASIC_EXPLOSION_LINGER) {
          // Destroy self
          Game.other_spell = null;
        }
      }
    },
    draw:  function draw(ctx) {
      // Draw self
      var t;
      if (this.countdown > 0) {
        t = this.countdown / BASIC_WINDUP;

        // Draw a circle where the explosion will happen
        ctx.beginPath();
        ctx.fillStyle = "#ff0";
        ctx.arc(this.x,this.y,t*BASIC_WINDUP_R,0,2*Math.PI,false);
        ctx.fill();
      } else {
        t = Math.floor(-this.countdown * BASIC_EXPLOSION_FRAMES / BASIC_EXPLOSION_LINGER);
        Game.drawImage(ctx, 'explosion_1.png',
          t * BASIC_EXPLOSION_SIZE,  // Slice x
          0,              // Slice y
          BASIC_EXPLOSION_SIZE,    // Slice width
          BASIC_EXPLOSION_SIZE,    // Slice height
          Math.round(this.x - BASIC_EXPLOSION_SIZE*0.5),   // Draw x
          Math.round(this.y - BASIC_EXPLOSION_SIZE*0.5),  // Draw y
          BASIC_EXPLOSION_SIZE,    // Draw width
          BASIC_EXPLOSION_SIZE);    // Draw height
      }
    },
    x:      x,
    y:      y,
    countdown:  BASIC_WINDUP
  };
};

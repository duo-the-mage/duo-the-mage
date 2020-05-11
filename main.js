// Load main library
var Game = window.Game || {};

Game.start = function() {


var ctx, lastFrameTime;

// Polyfill for animation frames
window.requestAnimationFrame = window.requestAnimationFrame ||
  function(_callback) {
    return window.setTimeout(function() {
      _callback(Date.now());
    },1);
  };
window.cancelAnimationFrame = window.cancelAnimationFrame ||
  function(_frame) {
    return window.clearTimeout(_frame);
  };

(function handlePageVisibility() {
  var hidden, visibilityChange;
  if (typeof document.hidden !== "undefined") { // Opera 12.10 and Firefox 18 and later support
    hidden = "hidden";
    visibilityChange = "visibilitychange";
  } else if (typeof document.mozHidden !== "undefined") {
    hidden = "mozHidden";
    visibilityChange = "mozvisibilitychange";
  } else if (typeof document.msHidden !== "undefined") {
    hidden = "msHidden";
    visibilityChange = "msvisibilitychange";
  } else if (typeof document.webkitHidden !== "undefined") {
    hidden = "webkitHidden";
    visibilityChange = "webkitvisibilitychange";
  }

  function handleVisibilityChange() {
    console.log("VC");

    if (document[hidden]) {
      Game.pause();
    } else {
      Game.resume();
    }
  };

  document.addEventListener(visibilityChange, handleVisibilityChange, false);
  window.addEventListener("blur",function() { Game.pause(); }, false);
  window.addEventListener("focus",function() { Game.resume(); }, false);

}());

Game.load = function load() {
  Game.ready = false;
  this.loadImages(function() {
    Game.loadSounds(start);
  });
};

function start() {
  Game.Input.init();

  Game.currentMode = 0;

  Game.ready = true;
  gameLoop();
}

Game.my_paused = false;
Game.other_paused = false;
Game.is_paused = () => Game.my_paused || Game.other_paused;
Game.pause = function pause() {
  if(!Game.my_paused) {
    Game.my_paused = true;
    Game.multiplayer_send({type: 'pause'});

/*
    ctx.beginPath();
    ctx.fillStyle = "rgba(0,0,0,0.5)";
    ctx.rect(0,0,800,480);
    ctx.fill();
*/

    this.update_music();
  }
};
Game.resume = function resume() {
  if(Game.my_paused && this.ready) {
    Game.my_paused = false;
    Game.multiplayer_send({type: 'unpause'});
    this.update_music();
  }
};

function gameLoop(_timestamp) {
  var elapsed;
  if (lastFrameTime  &&  Game.multiplayer_drift < 5000) {
    elapsed = _timestamp - lastFrameTime;
    if(Game.multiplayer_drift < 0)
      elapsed *= 1-Game.multiplayer_drift/2500;
    if(Game.multiplayer_drift > 2500)
      elapsed *= 2-Game.multiplayer_drift/2500;
    elapsed = Math.max(1, Math.min(elapsed, 100));
    Game.multiplayer_drift += elapsed;
    Game.drift_buffer += elapsed;
    onUpdate(elapsed);
    draw();
  }
  lastFrameTime = _timestamp;

  Game.nextFrame = window.requestAnimationFrame(gameLoop);
};

function onUpdate(elapsed) {
  var i;

  if(Game.currentMode === 1  &&  !Game.is_paused()) {
    // Main game play mode

    Game.other_player.update(elapsed);
    Game.player.update(elapsed);

    Game.camera.update(elapsed);

    if (Game.currentSpell) { Game.currentSpell.update(elapsed); }
    if (Game.other_spell) { Game.other_spell.update(elapsed); }

    for (i = 0; i < Game.actors.length; ++i) {
      Game.actors[i].update(elapsed);
    }

    for (i = Game.actors.length-1; i >= 0;--i) {
      if (Game.actors[i].isDestroyed) {
        Game.actors.splice(i,1);
      }
    }
  }
  
  if(Game.currentMode !== 1) {  // Menu mode
    if (Game.Input.mouse.button) {
      if (Game.currentMode === 2) {
        Game.player.respawn();
        Game.Input.mouse.button = false;
        Game.currentMode = 1;
        Game.restartMusicLoop();
      } else if(Game.hosting) {
        const random = Game.make_random(null);
        Game.multiplayer_send({type: 'initWorld', random: random.state});
        Game.initWorld(random);
        Game.Input.mouse.button = false;
        Game.currentMode = 1;
      }
    }
  }
};

function draw() {
  var i;
  // Main game mode
  if (Game.currentMode === 1) {
    ctx.translate(-Game.camera.x,-Game.camera.y);

    // Draw background
    (function() {
      var WIDTH = 800, HEIGHT = 480;
      var x = Math.floor(Game.camera.x / WIDTH) * WIDTH;
      var y = Math.floor(Game.camera.y / HEIGHT) * HEIGHT;
      Game.drawImage(ctx, 'background.png', x, y);
      Game.drawImage(ctx, 'background.png', x+WIDTH, y);
      Game.drawImage(ctx, 'background.png', x, y+HEIGHT);
      Game.drawImage(ctx, 'background.png', x+WIDTH, y+HEIGHT);
    }());

    // Draw walls
    for (i = 0; i < Game.walls.length; ++i) {
      Game.walls[i].draw(ctx);
    }

    // Draw enemies
    for (i = 0; i < Game.actors.length; ++i) {
      Game.actors[i].draw(ctx);
    }

    // Draw small keys
    for(i = 0;  i < Game.smallKeys.length;  ++i)
      Game.smallKeys[i].draw(ctx);

    Game.other_player.draw(ctx);

    // Draw player
    Game.player.draw(ctx);

    if (Game.currentSpell) { Game.currentSpell.draw(ctx); }
    if (Game.other_spell) { Game.other_spell.draw(ctx); }

    ctx.translate(Game.camera.x,Game.camera.y);

    // Draw UI
    Game.player.drawUI(ctx);

    // Draw darken overlay if paused
    if(Game.is_paused()) {
      ctx.beginPath();
      ctx.fillStyle = "rgba(0,0,0,0.5)";
      ctx.rect(0,0,800,480);
      ctx.fill();
    }
  }
  // Menu mode
  else {
    // Draw background
    Game.drawImage(ctx, 'background.png', 0, 0);

    switch(Game.currentMode) {
      // Title screen mode
      case 0:
        // Draw title
        Game.drawImage(ctx, 'title.png', 180, 20);
        // Draw prompt
        ctx.fillStyle = "#fff";
        ctx.font = "bold 16pt sans-serif";
        ctx.textAlign = "center";
        ctx.fillText("Use w, a, s, d to move",400,300);
        ctx.fillText("Use the mouse to cast spells",400,320);
        if(Game.hosting)
          ctx.fillText("Click to begin",400,420);
        else
          ctx.fillText('Please wait for the host to start the game!', 400, 420);
      break;
      // Death screen mode
      case 2:
        // Draw prompt
        ctx.fillStyle = "#00b";
        ctx.font = "bold 32pt serif";
        ctx.textAlign = "center";
        ctx.fillText("You have died.",400,100);

        ctx.fillStyle = "#fff";
        ctx.font = "bold 16pt sans-serif";
        ctx.textAlign = "center";
        ctx.fillText("Click to retry",400,420);
      break;
      // Victory screen mode
      case 3:
        // Draw prompt
        ctx.fillStyle = "#00b";
        ctx.font = "bold 32pt serif";
        ctx.textAlign = "center";
        ctx.fillText("Congratulations!",400,80);
        ctx.fillText("You've won!",400,130);

        ctx.fillStyle = "#fff";
        ctx.font = "bold 16pt sans-serif";
        ctx.textAlign = "center";
        if(Game.totalDeaths > 0)
          ctx.fillText("You used "+(Game.totalDeaths+1)+" lives to get here.",400,300);
        if(Game.hosting)
          ctx.fillText("Click to start over",400,420);
        else
          ctx.fillText('Please wait for the host to restart the game.', 400, 420);
      break;
    }
  }
};

var c = document.getElementById("myCanvas");

ctx = c.getContext("2d");

ctx.fillStyle = "#444";
ctx.font = "bold 16pt sans-serif";
ctx.textAlign = "center";
ctx.fillText("Loading, please wait...",400,240);

// Initialize game
Game.load();


};


window.onload = async function() {
  Game.loadMusic();

  await Game.start_multiplayer();
  Game.start();
};

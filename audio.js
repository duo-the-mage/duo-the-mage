// Load main library
var Game = window.Game || {};

(function() {
  var  soundList = [
      'intro.ogg',
      'loop.ogg',
      'block.wav',
      'death.wav',
      'enemy_die.wav',
      'explosion.wav',
      'hurt.wav',
      'key.wav',
      'laser.wav',
      'unlock.wav'
    ];

  // Pre-load all images
  var cache = {};
  Game.loadSounds = function(callback) {
    var numLoadedsounds = 0, i, snd, cacheLine;

    for(i = 0;  i < soundList.length;  ++i) {
      snd = new Audio();
      cacheLine = {sound: snd, ready: false, error: false};
      cache[soundList[i]] = cacheLine;
      // Call the callback after all images are loaded
      snd.addEventListener("canplaythrough", (function(_cacheline) { return function() {
        _cacheline.ready = true;
        ++numLoadedsounds;
        if(numLoadedsounds == soundList.length)
          callback();
      }}(cacheLine)),false);
      // Skip this sound if it failed to load
      snd.addEventListener("error", (function(_cacheline) { return function() {
        _cacheline.error = true;
        ++numLoadedsounds;
        if(numLoadedsounds == soundList.length)
          callback();
      }}(cacheLine)),false);
      snd.src = soundList[i];
    }
  }

  Game.playSound = function(filename) {
    if(!cache.hasOwnProperty(filename)) {
      var audio = new Audio(),
        cacheLine = {sound: audio, ready: false};
      audio.addEventListener("canplaythrough", function() {
        cacheLine.ready = true;
        audio.play();
      }, true);
      cache[filename] = cacheLine;
      audio.src = filename;
    } else {
      if(cache[filename].ready && !cache[filename].error)
        cache[filename].sound.play();
    }
  };

  let volume = 0;

  Game.update_music = function() {
    // Game.is_paused === undefined   is supposed to check for whether the WebRTC connection is active yet or not ...
    if(Game.is_paused === undefined  ||  (!Game.is_paused()  &&  Game.player.dead === 0  &&  volume > 0)) {
      Game.resumeMusic();
    } else {
      Game.stopMusic();
    }
  };

  window.addEventListener('load', function() {
    document.getElementById('volume').addEventListener('input', function() {
      const old_volume = volume;
      volume = parseFloat(this.value);

      Game.setMusicVolume(volume);

      if(this.value > 0  &&  old_volume === 0)
        Game.restartMusicLoop();
    });
  });


(function() {  // Web Audio API scope

var context = new AudioContext();
var loadSound = function(url, callback) {
  var request = new XMLHttpRequest();
  request.open('GET', url, true);
  request.responseType = 'arraybuffer';

  // Decode asynchronously
  request.onload = function() {
    context.decodeAudioData(request.response, callback,
        function() {console.log('Error loading sound');});
  }
  try {
    request.send();
  } catch(unused) {
  }
}
var playSound = function(b, time, loop, pos) {
  var source = context.createBufferSource();
  b.source = source;
  source.buffer = b.buffer;
  source.loop = loop;
  source.connect(b.gain);
  source.start(context.currentTime + time, pos);
  b.startTime = context.currentTime + time - pos;
}
var intro = {};
var loop = {};
var pos = 0;
var n = 2;
var musicShouldBePlaying = false;
var musicLoaded = function() {return n === 0;}
var cb = function() {
  if(--n > 0)
    return;

  if(musicShouldBePlaying)
    doResumeMusic();
};
var callback = function(b) {return function(buffer) {
  b.buffer = buffer;
  b.gain = context.createGain();
  b.gain.connect(context.destination);
  cb();
};};
Game.loadMusic = function() {
  loadSound('intro.ogg', callback(intro));
  loadSound('loop.ogg', callback(loop));
};
Game.stopMusic = function() {
  if(!musicShouldBePlaying) {
    console.log('stopMusic() called when music already stopped!');
    return;
  }

  musicShouldBePlaying = false;

  if(musicLoaded())
    doStopMusic();
};
var doStopMusic = function() {
  var introLength = intro.buffer.duration;
  var loopLength = loop.buffer.duration;

  if(intro.source) {
    intro.source.stop(0);
    intro.source.disconnect();
  }
  loop.source.stop(0);
  loop.source.disconnect();

  pos = (context.currentTime - intro.startTime);
  if(pos >= intro.buffer.duration) {
    pos = context.currentTime + introLength - loop.startTime;
    while(pos >= introLength + loopLength)
      pos -= loopLength;
  }
};
Game.resumeMusic = function() {
  if(musicShouldBePlaying) {
    console.log('resumeMusic() called when music already playing!');
    return;
  }

  musicShouldBePlaying = true;

  if(musicLoaded())
    doResumeMusic();
};
var doResumeMusic = function() {
  var introLength = intro.buffer.duration;
  if(pos < introLength) {
    playSound(intro, 0, false, pos);
    playSound(loop, introLength - pos, true, 0);
  } else {
    playSound(loop, 0, true, pos - introLength);
  }
};
Game.restartMusicLoop = function() {
  pos = 0;
  if(musicShouldBePlaying) {
    Game.stopMusic();
    pos = 0;
    Game.resumeMusic();
  }
  Game.update_music();
};
Game.setMusicVolume = function(v) {
  if(musicLoaded()) {
    intro.gain.gain.setValueAtTime(v, context.currentTime);
    loop.gain.gain.setValueAtTime(v, context.currentTime);
  }
};


}());  // Web Audio API scope


}());

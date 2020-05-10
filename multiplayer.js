window.Game = window.Game || {};

window.Game.start_multiplayer = async function() {


const root_div = document.getElementById('multiplayer_root_div');
const Peer = window.SimplePeer;
const str = function(data) {
  if(data === undefined) {
    return 'undefined';
  } else {
    const s = JSON.stringify(data);
    if(s.length > 30)
      return s.substring(0, 30) + '...';
    else
      return s;
  }
};
const wrap = ((f, self, args) => new Promise((resolve, reject) => {
  const a = args.slice();
  a.push(resolve);
  Function.prototype.apply.call(f, self, a);
}));
let n = 0;
const buffered_wrap = function(f, self, args) {
  const N = n++;
  const buffer = [];
  const listener_buffer = [];
  const a = args.slice();
  a.push(function(data) {
//    console.log(N + ' buffered: ' + str(data));
    buffer.push(data);
    if(listener_buffer.length > 0)
      listener_buffer[0]();
  });
  Function.prototype.apply.call(f, self, a);
  return (() => new Promise((resolve,reject) => {
    const eat = function() {
      const result = buffer[0];
      buffer.splice(0, 1);
      listener_buffer.splice(0, 1);
//      console.log(N + ' unbuffered: ' + str(result));
      resolve(result);
    };
    listener_buffer.push(eat);
    if(buffer.length > 0)
      eat();
  }));
};
const make_real_socket = function(socket) {
  const on_connect = buffered_wrap(socket.on, socket, ['connect']);
  const receive = (function() {
    const f = buffered_wrap(socket.on, socket, ['message']);
    return async function() {
      const m = await f();
      return JSON.parse(m);
    };
  }());
  socket.on('disconnect', function() {console.log('Disconnected.');});
  const send = function(s) {
//    console.log('sending: ' + str(s));
    socket.send(JSON.stringify(s));
  };
  return {on_connect, send, receive};
};
const make_real_peer = function(peer) {
  const on_signal = buffered_wrap(peer.on, peer, ['signal']);
  const on_connect = buffered_wrap(peer.on, peer, ['connect']);
  const on_data = (function() {
    const f = buffered_wrap(peer.on, peer, ['data']);
    return async function() {
      const m = await f();
      return JSON.parse(m+'');
    };
  }());
  const signal = ((x) => peer.signal(x));
  const send = function(s) {
//    console.log('rtc_send: ' + str(s));
    peer.send(JSON.stringify(s));
  };
  return {signal, on_signal, on_data, send, on_connect};
};
const spawn = function(async_function) {
  return async_function();
};
const make_channel = () => {
  let resolver = null;
  const promise = new Promise((resolve) => {
    resolver = resolve;
  });
  return {
    send(x) {
      resolver(x);
    },
    receive: () => promise
  };
};

const finished = make_channel();

const socket = make_real_socket(window.io('https://webrtc-multiplayer-hello.glitch.me', {reconnection: false}));
await socket.on_connect();

const b1 = document.createElement('button');
root_div.appendChild(b1);
b1.innerText = 'Guest';

const b2 = document.createElement('button');
root_div.appendChild(b2);

let peer;
  
b1.onclick = async function() {
  b1.remove();
  b2.remove();
  
  const input = document.createElement('input');
  root_div.appendChild(input);
  const b3 = document.createElement('button');
  root_div.appendChild(b3);
  b3.innerText = 'Submit room code';
  const ch = make_channel();
  b3.onclick = () => ch.send();

  await ch.receive();
  
  input.remove();
  b3.remove();

  socket.send('Guest');
  socket.send(input.value);

  peer = make_real_peer(new Peer({initiator: true}));
  Game.hosting = false;

  finished.send();
};

const chat = document.createElement('div');
root_div.appendChild(chat);
const say = function(m) {
  const line = document.createElement('p');
  line.innerText = m+'';
  chat.appendChild(line);
};

b2.innerText = 'Host';
b2.onclick = async function() {
  b1.remove();
  b2.remove();

  socket.send('Host');
  const id = await socket.receive();

  const div = document.createElement('div');
  root_div.appendChild(div);
  div.innerText = id;

  peer = make_real_peer(new Peer());
  Game.hosting = true;

  finished.send();
};

await finished.receive();

spawn(async function() {
  for(;;) {
    const data = await peer.on_signal();
    socket.send({type: 'signal', data: data});
  }
});

spawn(async function() {
  for(;;) {
    const m = await socket.receive();
    if(m.type === 'signal')
      peer.signal(m.data);
  }
});

await peer.on_connect();

root_div.remove();

const make_state = () => [Game.actors, Game.player, Game.smallKeys, Game.wallGrid];

const sync_buffer = [];
const other_sync_buffer = [];
let desynced = false;

const clean_buffers = function() {
  while(sync_buffer.length > 0  &&  other_sync_buffer.length > 0) {
    if(sync_buffer[0].hash !== other_sync_buffer[0].hash  &&  !desynced) {
      peer.send({type: 'desync', state: stringify(make_state())});
      desynced = true;
    }

    sync_buffer.splice(0, 1);
    other_sync_buffer.splice(0, 1);
  }
};

const id2actor = (id) => {
  for(let i=0; i<Game.actors.length; ++i)
    if(Game.actors[i].unique_id === id)
      return Game.actors[i];
  return null;
};

Game.multiplayer_drift = 0;
Game.drift_buffer = 0;
Game.movement_buffer = [];
Game.other_movement_buffer = [];
setInterval(function() {
  peer.send({type: 'elapsed', elapsed: Game.drift_buffer});
  Game.drift_buffer = 0;

  Game.movement_buffer.push({type: 'teleport', x: Game.player.x, y: Game.player.y});
  peer.send({type: 'movement', actions: Game.movement_buffer});
  Game.movement_buffer.splice(0);
}, 100);
spawn(async function() {
  for(;;) {
    const msg = await peer.on_data();
    if(msg.type === 'sync') {
      other_sync_buffer.push(msg);
      clean_buffers();
    } else if(msg.type === 'desync') {
      desynced = true;
      console.log('Other state: ', JSON.parse(msg.state));
      console.log('My state: ', make_state());
    } else if(msg.type === 'elapsed') {
      Game.multiplayer_drift -= msg.elapsed;
    } else if(msg.type === 'movement') {
      Game.other_movement_buffer.push(...msg.actions);
    } else if(msg.type === 'initWorld') {
      Game.initWorld(Game.make_random(msg.random));
    } else if(msg.type === 'destroy') {
      const actor = id2actor(msg.id);
      if(actor === null)  // Probably a laser
        console.log('desync!');
      else
        actor.destroy();
    } else if(msg.type === 'fire laser') {
      const bat = id2actor(msg.bat_id);
      if(bat === null) {
        console.log('desync!')
      } else {
        const GRID_SIZE = 32;
        Game.addLaser(msg.laser_id, bat.x + GRID_SIZE/2, bat.y + GRID_SIZE/2 + 1, msg.tx, msg.ty);
      }
    } else if(msg.type === 'unlock') {
      Game.removeWall(msg.x, msg.y);
      if(Game.onscreen_ji(msg.x, msg.y))
        Game.playSound('unlock.wav');
    } else if(msg.type === 'destroy key in world') {
      for(let i=0; i<Game.smallKeys.length; ++i) {
        if(Game.smallKeys[i].unique_id === msg.id) {
          Game.smallKeys.splice(i, 1);
          break;
        }
      }
    } else if(msg.type === 'change key count') {
      Game.player.smallKeys += msg.amount;
      if(msg.amount > 0)
        Game.playSound('key.wav');
    } else if(msg.type === 'spike attack') {
      const spike = id2actor(msg.id);
      if(spike === null) {
        console.log('desync!');
      } else {
        if(spike.currentDir === -1) {
          spike.currentDir = msg.dir;
          spike.currentSpeed = spike.ATTACK_SPEED;
        }
      }
    } else if(msg.type === 'cast') {
      Game.other_player.cast_spell(msg.x, msg.y);
    }
/*
    console.log(msg);
    Object.assign(other_state, msg);
    update_view();
*/
  }
});

const stringify = function(obj) {
  const f = (x) => {
    if(Array.isArray(x)) {
      let r = '[';
      for(let i=0; i<x.length; ++i)
        r += f(x[i]) + ',';
      if(x.length > 0)
        r = r.substring(0, r.length - 1);
      r += ']';
      return r;
    } else if(typeof x === 'object'  &&  x !== null) {
      let r = '{';
      const keys = Object.keys(x);
      keys.sort();
      for(let i=0; i<keys.length; ++i)
        r += JSON.stringify(keys[i]) + ':' + f(x[keys[i]]) + ','
      if(keys.length > 0)
        r = r.substring(0, r.length - 1);
      r += '}'
      return r;
    } else {
      return JSON.stringify(x);
    }
  };

  return f(obj);
};

const digest = async function(obj) {
  return (
    Array.from(new Uint8Array(await crypto.subtle.digest('SHA-256', new TextEncoder().encode(stringify(obj)))))
    .map(b=>b.toString(16).padStart(2,'0')).join('')
  );
};

let sequence_number = 0;
Game.multiplayer_sync = async function() {
  if(Game.hosting) {
    const n = sequence_number;
    ++sequence_number;
    const hash = await digest(make_state());
    const sync = {type: 'sync', hash};
    sync_buffer.push(sync);
    peer.send(sync);

    clean_buffers();
  } else {
    
  }
};

Game.multiplayer_send = function(msg) {
  peer.send(msg);
};


};

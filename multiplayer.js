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
    console.log(N + ' buffered: ' + str(data));
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
      console.log(N + ' unbuffered: ' + str(result));
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
    console.log('sending: ' + str(s));
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
    console.log('rtc_send: ' + str(s));
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

  const peer = make_real_peer(new Peer({initiator: true}));
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

  setInterval(function() {
//    peer.send(my_state);
  }, 100);
  spawn(async function() {
    for(;;) {
      const msg = await peer.on_data();
/*
      console.log(msg);
      Object.assign(other_state, msg);
      update_view();
*/
    }
  });

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

  const peer = make_real_peer(new Peer());
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
  
  div.remove();

  spawn(async function() {
    for(;;) {
      const msg = await peer.on_data();
/*
      console.log(msg);
      Object.assign(other_state, msg);
      update_view();
*/
    }
  });
  setInterval(function() {
//    peer.send(my_state);
  }, 100);

  finished.send();
};

await finished.receive();


};

const assert = require('assert');
const http = require('http');
const socket_io = require('socket.io');
const express = require('express');
const app = express();
app.use(express.static('public'));
const server = http.createServer(app);
const wss = socket_io(server);

const str = function(data) {
  if(data === undefined)
    return 'undefined';
  else
    return JSON.stringify(data);
};
const trunc = function(s) {
  if(s.length > 62)
    return s.substring(0, 62) + '...';
  else
    return s;
};
const make_real_socket = function(socket) {
  const buffer = [];
  let buffer_listener = function() {};
  socket.on('message', function(s) {
    console.log('buffered: ' + trunc(s));
    buffer.push(s);
    const f = buffer_listener;
    buffer_listener = function() {};
    f();
  });
  const receive = () => new Promise((resolve,reject) => {
    const eat = function() {
      const s = buffer[0];
      buffer.splice(0, 1);
      console.log('received: ' + trunc(s));
      resolve(JSON.parse(s));
    };

    if(buffer.length > 0)
      eat();
    else
      buffer_listener = eat;
  });
  const send = function(data) {
    console.log('sending: ' + trunc(str(data)));
    socket.send(str(data));
  };
  return {
    receive,
    send,
  };
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

const hosts = {};

wss.on('connection', async function(ws) {


console.log('Connection received.');
const socket = make_real_socket(ws);
const x = await socket.receive();
let other_socket = null;
if(x === 'Host') {
  if(Object.keys(hosts).length > 100)
    return socket.disconnect();
  
  let id;
  do
    id = Math.floor(Math.random() * 10000).toString(10).padStart(4, '0');
  while(hosts[id] !== undefined);

  socket.send(id);
  const channel = make_channel();
  let must_cleanup = true;
  const cleanup = () => {
    if(must_cleanup) {
      delete hosts[id];
      console.log('Hosts', hosts);
    }
    must_cleanup = false;
  };
  ws.on('disconnect', cleanup);
  hosts[id] = {socket, channel};
  console.log('Hosts', hosts);
  other_socket = await channel.receive();
  cleanup();
} else if(x === 'Guest') {
  const id = await socket.receive();
  if(hosts[id] === undefined)
    return socket.disconnect();
  other_socket = hosts[id].socket;
  hosts[id].channel.send(socket);
}

for(;;) {
  const x = await socket.receive();
  assert(x.type === 'signal', x);
  other_socket.send(x);
}


});
server.listen(process.env.PORT);
console.log('Listening on port ' + process.env.PORT);
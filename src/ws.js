const { WebSocketServer } = require('ws');
const { generate } = require('./functions/key.js');
const { cipher } = require('./functions/cipher.js');
const color = require('./functions/color.js');

let key;
let wss;

function userTerminate(ws) {
  ws.terminate();
};

function send({ client: client, data: data }) {
  if (data.type === 'file') {
    wss.clients.forEach((user) => {
      if (user.id === data.content.user) user.send(cipher({ key: key, data: JSON.stringify(data) }));
    });
  } else if (data.type === 'key') {
    client.send(cipher({ key: null, data: JSON.stringify(data) }));
  } else {
    wss.clients.forEach((user) => {
      if (user.id != client.id) user.send(cipher({ key: key, data: color(`[${client.name}]  - ${data.content}`, 'white') }));
    });
  };
};

function heartbeat(ws) {
  ws.isAlive = true;
};

function onError(ws, err) {
  console.log('OnError:', err.message);
};

function onMessage(ws, data) {
  if (!data) return userTerminate(ws);
  const info = (JSON.parse(data.toString()));
  ws.id = info.id || null;
  ws.name = info.name || null;
  if (!ws.id || !ws.name) return userTerminate(ws);
  if (!info.res) {
    send({ client: ws, data: {
      type: 'key',
      content: key
    }});
    wss.clients.forEach((user) => {
      user.send(cipher({ key: false, data: color(`${ws.name} conectado!`, 'green') }));
    });
  } else {
    send({ client: ws, data: info });
  }
};

function onConnection(ws, req, client) {
  ws.isAlive = true;
  ws.on('pong', () => heartbeat(ws));
  ws.on('message', (data) => onMessage(ws, data));
  ws.on('error', (error) => onError(ws, error));
  ws.on('close', () => {
    wss.clients.forEach((user) => {
      user.send(cipher({ key: false, data: color(`${ws.name} saiu!`, 'red') }));
    });
    userTerminate(ws);
  });
};

module.exports = {
  connect: async (server) => {

    key = await generate();
    wss = new WebSocketServer({ server });

    const interval = setInterval(() => {
      wss.clients.forEach((ws) => {
        if (ws.isAlive === false) return userTerminate(ws);
        ws.isAlive = false;
        ws.ping();
      });
    }, 30000);

    wss.on('connection', (ws, request, client) => onConnection(ws, request, client));

    console.log(color('[status]', 'blue'), color(' - WebSocketServer iniciado.', 'white'));

    return wss;

  },
  clients: async () => {

    const res = [];

    wss.clients.forEach((user) => {
      res.push({
        name: user.name,
        id: user.id
      });
    });

    return res;

  }
};

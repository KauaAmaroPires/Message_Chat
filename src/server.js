const { connect } = require('ngrok');
const color = require('./functions/color.js');
const express = require('express');
const cors = require('cors');
const helmet = require('helmet');
const morgan = require('morgan');
const ws = require('./ws.js');

const app = express();

app.use(cors({
  origin: process.env.ORIGIN || '*'
}));
app.use(helmet());
app.use(express.json());
app.use(morgan('dev'));

app.get('/clients', async (req, res, next) => {
  const clients = await ws.clients();
  res.json(clients);
});

const server = app.listen(process.env.PORT || 8080, () => {});

(async () => {

  const wss = await ws.connect(server);

  const url = await connect({
    addr: process.env.PORT || 8080,
    onStatusChange: (status) => {
      console.log(color(`[status]`, 'blue'), color(` - ${status}`, 'white'));
    },
    onLogEvent: (log) => {
      console.log(color(`[log]`, 'magenta'), color(` - ${log}`, 'white'));
    }
  });

  const URL = url.replace('http://', 'ws://').replace('https://', 'wss://');

  console.log('\n\n');
  console.log(color('+================================================================================+', 'yellow'));
  console.log('\n\n');
  console.log(color(`             URL ---> ${URL}`, 'white'));
  console.log('\n\n');
  console.log(color('+================================================================================+', 'yellow'));
  console.log('\n\n');

})();

process.on("multipleResolves", (type, promise, reason) => {
  console.log(`Vários erros identificados:\n\n` + type, promise, reason);
});

process.on("unhandRejection", (reason, promise) => {
  console.log(`Erros identificado:\n\n` + reason, promise);
});

process.on("uncaughtException", (error, origin) => {
  console.log(`Erros identificado:\n\n` + error, origin);
});

process.on("uncaughtExceptionMonitor", (error, origin) => {
  console.log(`Erros identificado:\n\n` + error, origin);
});

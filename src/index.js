const color = require('./functions/color.js');
const { readdirSync, writeFileSync, writeFile } = require('fs');
const { decipher } = require('./functions/cipher.js');
const Client = require('ws');
let client;
const { v4: uuidv4 } = require('uuid');
const user = process.env.NAME || `User_${(uuidv4()).slice(0, 5)}`;

const imput = process.stdin;
imput.setEncoding('utf-8');

const prefix = process.env.PREFIX;
const commands = new Map();
const aliases = new Map();

let open = false;
let room = false;

function cmdLoad() {
  const cmds = readdirSync('./src/commands/').filter(file => file.endsWith('.js'));

  cmds.forEach(file => {
    let pull = require(`./commands/${file}`);

    if (pull.name) {
      commands.set(pull.name, pull);
      if (pull.aliases && Array.isArray(pull.aliases)) pull.aliases.forEach(alias => aliases.set(alias, pull.name));
    };
  });
};

function invite() {
  console.log('\n\n');
  console.log(color(`             //Digite '${prefix}help' para ver os comandos de chat.//`, 'white'));
  console.log(color('+-================================================================================-+', 'yellow'));
  console.log('\n\n');
  console.log(color('             -+| Insira o link de conversa abaixo. |+-', 'white'));
  console.log('\n\n');
  console.log(color('+-================================================================================-+', 'yellow'));
  console.log('\n\n');
};

function validateLink(data) {

  let validate = false;

  if (data.includes('wss://')) {
    if (data.split('wss://').join('').length > 0) validate = true;
  };

  if (data.includes('ws://')) {
    if (data.split('ws://').join('').length > 0) validate = true;
  };

  return validate;

};

cmdLoad();
invite();

imput.on('data', async (data) => {

  if (data.trim().split(' ') === 0) return;
  if (data.trim().length <= 0) return;

  if (!room) {

    if (!validateLink(data.trim())) return console.log(color('[ERROR]  - ' + 'Link inválido', "red"));

    client = new Client(data.trim().split(' ').join(''));

    client.on('error', (err) => {

      const message = err.message;

      if (message.includes(': 404')) return console.log(color('[ERROR]  - ' + 'Link inválido ' + data.trim(), "red"));

    });

    client.on('open', () => {
      console.clear();
      room = true;
      client.name = user.split(' ').join('_');
      client.id = uuidv4();
      client.invite = data.trim().split(' ').join('');
      client.send(JSON.stringify({
        type: 'txt',
        content: '',
        name: client.name,
        id: client.id,
        res: open
      }));
      open = true;
    });

    client.on('close', () => {
      console.clear();
      if (client) {
        console.log(color('[ERROR]  - ' + 'Servidor off', "red"));
        client.terminate();
      };
      client = null;
      room = false;
      open = false;
      invite();
    });

    client.on('ping', () => {});

    client.onmessage = async (event) => {
      let data = await decipher({ key: client.key, data: event.data });
      if (!data || !data.length === 0) data = await decipher({ key: false, data: event.data });
      if (!data || !data.length === 0) return;
      if (data.includes("type: 'key'") || data.includes('"type":"key"')) {
        const obj = JSON.parse(data);
        client.key = obj.content;
      } else if (data.includes("type: 'file'") || data.includes('"type":"file"')) {
        const obj = JSON.parse(data);
        if (!readdirSync("./app_download").includes(obj.content.name)) {
          writeFileSync(`./app_download/${obj.content.name}`, obj.content.content, 'base64');
        } else {
          await writeFile(`./app_download/${obj.content.name}`, obj.content.content, 'base64', err => {
            if (err) throw err;
          })
        };
        return console.log("Você recebeu um arquivo, olhe a pasta 'app_download'.");;
      } else {
        return console.log(data);
      };
    };

  } else if (data.trim().startsWith(prefix)) {

    const args = data.trim().slice(prefix.length).trim().split(/ +/g);
    const cmd = args.shift().toLowerCase();

    if (cmd.length === 0) return;

    let command = commands.get(cmd);
    if (!command) command = commands.get(aliases.get(cmd));

    if (command) {
      await command.run({ client: client, args: args, res: open, commands: commands, aliases: aliases }).catch(e => {
        console.log(e);
      });
    } else {
      console.log(color('[ERROR]  - ' + 'Comando inválido', "red"));
    }

  } else {

    client.send(JSON.stringify({
      type: 'txt',
      content: data.trim(),
      name: client.name,
      id: client.id,
      res: open
    }));

  };

});

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

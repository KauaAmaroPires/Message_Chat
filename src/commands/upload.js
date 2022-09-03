const { readFileSync, readdirSync, writeFileSync, writeFile } = require('fs');
const { get } = require('axios');
const prefix = process.env.PREFIX;

module.exports = {
    name: "upload",
    aliases: ["upar"],

    run: async ({ client: client, args: args, res: open }) => {

      let file = readdirSync("./app_upload/");

      if (file.length === 0) return console.log("Adicione um arquivo na pasta 'app_upload' para mandar um arquivo.");

      if (!args[0] || !args[1]) return console.log(`Digite o nome do arquivo e tambem quem vai receber: '${prefix}upload user photo.png'\n  ${file.join('\n  ')}`);

      let res = await get((client.invite || '').replace('ws://', 'http://').replace('wss://', 'https://') + '/clients').catch(e => {});

      if (!res || !res.data || res.data.length === 0) return console.log(color(`[ERROR]  - Nenhum usuário encontrado.`, "red"));

      res = res.data.filter(x => x.name.toLowerCase().includes(args[0].toLowerCase()))[0];

      const search = args.slice(1).join(" ");

      file = file.filter(x => x.toLowerCase().includes(search.toLowerCase()))[0];

      if (!file || !res || res.length === 0 || res.id === client.id) return console.log(`Digite o nome do arquivo e tambem quem vai receber: '${prefix}upload user photo.png'\n  ${readdirSync("./app_upload/").join('\n  ')}`);

      const arquivo = await readFileSync(`./app_upload/${file}`, {
        encoding: 'base64'
      });

      client.send(JSON.stringify({
        type: 'file',
        content: {
          name: file,
          user: res.id,
          content: arquivo
        },
        name: client.name,
        id: client.id,
        res: open
      }));

      console.log('Arquivo enviado.');

    }
}

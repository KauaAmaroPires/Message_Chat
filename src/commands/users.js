const color = require('../functions/color.js');
const { get } = require('axios');

module.exports = {
    name: "users",
    aliases: ["members", "usuarios"],

    run: async ({ client: client }) => {

      const res = await get((client.invite || '').replace('ws://', 'http://').replace('wss://', 'https://') + '/clients').catch(e => {});

      if (!res || !res.data || res.data.length === 0) return console.log(color(`[ERROR]  - Nenhum usuário encontrado.`, "red"));

      const users = [];

      res.data.forEach(user => {
        users.push(`  -- ${user.name}`);
      });

      console.log(`Usuários:\n${users.join('\n')}`);

    }
}

const color = require('../functions/color.js');

module.exports = {
    name: "invite",
    aliases: ["in", "convite"],

    run: async ({ client: client }) => {
      console.log(color(`Link do server: ${client.invite}`, "blue"));
    }
}

module.exports = {
    name: "close",
    aliases: ["c", "sair"],

    run: async ({ client: client }) => {
      client.emit('close');
    }
}

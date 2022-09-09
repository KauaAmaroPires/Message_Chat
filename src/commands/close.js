module.exports = {
    name: "close",
    aliases: ["c", "sair"],

    run: async () => {
      client.emit('close');
    }
}

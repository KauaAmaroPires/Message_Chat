module.exports = {
    name: "clear",
    aliases: ["limpar"],

    run: async ({ client: client }) => {
      console.clear();
    }
}

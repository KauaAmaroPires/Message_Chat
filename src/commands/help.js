const prefix = process.env.PREFIX;

module.exports = {
    name: "help",
    aliases: ["h", "commands", "comandos"],

    run: async ({ commands: commands, aliases: aliases }) => {

      const log = [];

      commands.forEach((cmdvalue, cmdkey) => {

        let st = '  -- ' + `${prefix}${cmdkey}`;
        const alias = [];

        aliases.forEach((value, key) => {
          if (value === cmdkey) alias.push(`${prefix}${key}`);
        });

        if (alias.length > 0) st += `, ${alias.join(', ')}`

        log.push(st);

      });

      console.log(`commands:\n${log.join('\n')}`);

    }
}

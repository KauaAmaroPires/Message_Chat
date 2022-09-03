const md5 = require('md5');

module.exports = {
  generate: async () => {

    const max = 99999999999999999999, min = 1;

    const random = `${(Math.floor(Math.random() * (max - min + 1)) + min)}`.padStart(20, '0');

    const key = await md5(random);

    return key;

  }
};

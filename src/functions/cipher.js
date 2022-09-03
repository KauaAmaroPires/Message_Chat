const crypto = require('crypto-js');
const info = {
  algoritmo: 'AES',
  key_temp: 'secret_key_temp'
};

module.exports = {
  cipher: ({ key: key, data: data }) => {
    const cipher = crypto[info.algoritmo].encrypt(data, key || info.key_temp).toString();
    return cipher;
  },
  decipher: ({ key: key, data: data }) => {
    const decipher = crypto[info.algoritmo].decrypt(data, key || info.key_temp).toString(crypto.enc.Utf8);
    return decipher;
  }
};

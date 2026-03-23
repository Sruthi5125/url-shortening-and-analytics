

const { customAlphabet } = require("nanoid");

const alphabet = "ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789";

const generateShortCode = customAlphabet(alphabet, 6);

module.exports = generateShortCode;

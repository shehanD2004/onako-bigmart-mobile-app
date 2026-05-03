const jwt = require('jsonwebtoken');

const generateAccessToken = (id) => {
  return jwt.sign({ id }, process.env.JWT_ACCESS_SECRET || process.env.JWT_SECRET || 'nexastore_access_secret_key_2024', {
    expiresIn: process.env.JWT_ACCESS_EXPIRES || '15m',
  });
};

const generateRefreshToken = (id) => {
  return jwt.sign({ id }, process.env.JWT_REFRESH_SECRET || process.env.JWT_SECRET || 'nexastore_refresh_secret_key_2024', {
    expiresIn: process.env.JWT_REFRESH_EXPIRES || '7d',
  });
};

module.exports = { generateAccessToken, generateRefreshToken };

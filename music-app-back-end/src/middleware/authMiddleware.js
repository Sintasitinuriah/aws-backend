/* eslint-disable linebreak-style */
/* eslint-disable import/no-extraneous-dependencies */
const jwt = require('jsonwebtoken');

const authenticateToken = (request, h) => {
  const authHeader = request.headers.authorization;
  const token = authHeader && authHeader.split(' ')[1];

  if (!token) {
    return h.response({
      status: 'fail',
      message: 'Token tidak tersedia',
    }).code(401).takeover();
  }

  try {
    const decoded = jwt.verify(token, process.env.ACCESS_TOKEN_KEY);
    request.user = decoded;
    return h.continue;
  } catch (err) {
    return h.response({
      status: 'fail',
      message: 'Token tidak valid',
    }).code(403).takeover();
  }
};

module.exports = authenticateToken;

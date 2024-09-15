/* eslint-disable linebreak-style */
// routes/authRoutes.js

const authHandler = require('../handlers/authHandler');

const authRoutes = [
  {
    method: 'POST',
    path: '/authentications',
    handler: authHandler.loginHandler,
    options: {
      auth: false,
    },
  },
  {
    method: 'DELETE',
    path: '/authentications',
    handler: authHandler.logoutHandler,
    options: {
      auth: false,
    },
  },
  {
    method: 'PUT',
    path: '/authentications',
    handler: authHandler.refreshTokenHandler,
    options: {
      auth: false,
    },
  },
];

module.exports = authRoutes;

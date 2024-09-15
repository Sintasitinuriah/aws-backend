/* eslint-disable linebreak-style */
const usersHandler = require('../handlers/usersHandler');

const usersRoutes = [
  {
    method: 'POST',
    path: '/users',
    options: {
      handler: usersHandler.createUser,
    },
  },
];

module.exports = usersRoutes;

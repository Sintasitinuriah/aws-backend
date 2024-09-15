/* eslint-disable linebreak-style */
const { addCollaborator, deleteCollaborations } = require('../handlers/colabHandler');

const collaborationsRoutes = [
  {
    method: 'POST',
    path: '/collaborations',
    handler: addCollaborator,
    options: {
      auth: 'jwt',
    },
  },
  {
    method: 'DELETE',
    path: '/collaborations',
    handler: deleteCollaborations,
    options: {
      auth: 'jwt',
    },
  },
];

module.exports = collaborationsRoutes;

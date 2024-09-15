/* eslint-disable linebreak-style */
const { exportPlaylistHandler } = require('../handlers/exportHandler');

const exportRoutes = [
  {
    method: 'POST',
    path: '/export/playlists/{playlistId}',
    handler: exportPlaylistHandler,
    options: {
      auth: 'jwt',
    },
  },
];

module.exports = exportRoutes;

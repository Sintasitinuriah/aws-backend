/* eslint-disable linebreak-style */
const activityHandler = require('../handlers/activityHandler');

const activityRoutes = [
  {
    method: 'GET',
    path: '/playlists/{playlistId}/activities',
    handler: activityHandler.getPlaylistActivity,
    options: {
      auth: 'jwt',
    },
  },
];

module.exports = activityRoutes;

/* eslint-disable linebreak-style */
/* eslint-disable no-undef */
/* eslint-disable object-curly-newline */

// routes/playlistRoutes.js
const { addPlaylistHandler, deletePlaylistHandler, getUserPlaylistsHandler, displayAndAddSongToPlaylistHandler, deleteSongFromPlaylistHandler, getUserPlaylistsWithSongsHandler } = require('../handlers/playlistHandler');

const playlistRoutes = [
  {
    method: 'POST',
    path: '/playlists',
    options: {
      auth: 'jwt',
      handler: addPlaylistHandler,
    },
  },
  {
    method: 'DELETE',
    path: '/playlists/{id}',
    options: {
      auth: 'jwt',
      handler: deletePlaylistHandler,
    },
  },
  {
    method: 'GET',
    path: '/playlists',
    options: {
      auth: 'jwt',
      handler: getUserPlaylistsHandler,
    },
  },
  {
    method: 'POST',
    path: '/playlists/{playlistId}/songs',
    handler: displayAndAddSongToPlaylistHandler,
    options: {
      auth: 'jwt',
    },
  },

  {
    method: 'DELETE',
    path: '/playlists/{playlistId}/songs',
    handler: deleteSongFromPlaylistHandler,
    options: {
      auth: 'jwt',
    },
  },
  {
    method: 'GET',
    path: '/playlists/{playlistId}/songs',
    handler: getUserPlaylistsWithSongsHandler,
    options: {
      auth: 'jwt',
    },
  },
];

module.exports = playlistRoutes;

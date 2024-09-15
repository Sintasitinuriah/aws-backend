/* eslint-disable no-trailing-spaces */
const songsHandler = require('../handlers/songsHandler');

const songsRoutes = [
  {
    method: 'POST',
    path: '/songs',
    options: {
      handler: songsHandler.createSong,
    },
  },
  {
    method: 'GET',
    path: '/songs/{id}',
    options: {
      handler: songsHandler.getSongById,
    },
  },  
  {
    method: 'GET',
    path: '/songs',
    handler: songsHandler.getAllSongs,
  },
  {
    method: 'PUT',
    path: '/songs/{id}',
    options: {
      handler: songsHandler.updateSong,
    },
  },
  {
    method: 'DELETE',
    path: '/songs/{id}',
    options: {
      handler: songsHandler.deleteSong,
    },
  },
];

module.exports = songsRoutes;

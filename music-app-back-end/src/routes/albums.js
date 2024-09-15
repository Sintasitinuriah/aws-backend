/* eslint-disable no-trailing-spaces */
const albumsHandler = require('../handlers/albumsHandler');

const albumsRoutes = [
  {
    method: 'POST',
    path: '/albums',
    options: {
      handler: albumsHandler.createAlbum,
    },
  },   
  {
    method: 'GET',
    path: '/albums/{id}',
    options: {
      handler: albumsHandler.getAlbumById,
    },
  },
  {
    method: 'PUT',
    path: '/albums/{id}',
    options: {
      handler: albumsHandler.updateAlbum,
    },
  },
  {
    method: 'DELETE',
    path: '/albums/{id}',
    handler: albumsHandler.deleteAlbum,
  },
];

module.exports = albumsRoutes;

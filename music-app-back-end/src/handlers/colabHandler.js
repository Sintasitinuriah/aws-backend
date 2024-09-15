/* eslint-disable linebreak-style */
const Joi = require('joi');
const db = require('../config/database');
const { createColaborations, deleteColaborations } = require('../controllers/colabController');

// Handler untuk membuat collaboration

// eslint-disable-next-line consistent-return
const addCollaborator = async (request, h) => {
  const schema = Joi.object({
    playlistId: Joi.string().pattern(/^playlist-[A-Za-z0-9]{11}$/).optional(),
    userId: Joi.string().pattern(/^user-[A-Za-z0-9]{14}$/).required(),
  });

  const { error } = schema.validate(request.payload);
  if (error) {
    const isInvalidFormat = error.details.some((details) => details.message.includes('pattern') || details.message.includes('format'));

    if (isInvalidFormat) {
      return h.response({
        status: 'fail',
        message: 'Format playlistId atau songId tidak valid',
      }).code(404);
    }
    return h.response({
      status: 'fail',
      message: error.details[0].message,
    }).code(400);
  }

  const { playlistId, userId } = request.payload;

  // Cek apakah userId dan playlistId valid dan cek hak akses
  const queryPlaylist = {
    text: 'SELECT id, owner FROM "Playlists" WHERE id = $1',
    values: [playlistId],
  };

  const playlist = await db.oneOrNone(queryPlaylist);

  if (!playlist) {
    return h.response({
      status: 'fail',
      message: 'Playlist tidak ditemukan',
    }).code(404);
  }

  if (playlist.owner !== request.auth.credentials.userId) {
    return h.response({
      status: 'fail',
      message: 'Anda tidak memiliki izin untuk menambahkan kolaborator ke playlist ini',
    }).code(403);
  }

  try {
    const addedColaborations = await createColaborations(playlistId, userId);

    return h.response({
      status: 'success',
      message: 'Kolaborator berhasil ditambahkan',
      data: {
        collaborationId: addedColaborations.id,
      },
    }).code(201);
  // eslint-disable-next-line no-shadow
  } catch (error) {
    console.error('Database error:', error);
    return h.response({
      status: 'error',
      message: 'Terjadi kesalahan pada server',
    }).code(500);
  }
};

// Delete a collaborations from playlist
const deleteCollaborations = async (request, h) => {
  const schema = Joi.object({
    playlistId: Joi.string().pattern(/^playlist-[A-Za-z0-9]{11}$/).required(),
    userId: Joi.string().pattern(/^user-[A-Za-z0-9]{14}$/).required(),
  });

  const { error } = schema.validate(request.payload);
  if (error) {
    return h.response({
      status: 'fail',
      message: 'Invalid playlistId or userId format',
    }).code(400);
  }

  const { playlistId, userId } = request.payload;
  const authenticatedUserId = request.auth.credentials.userId;

  try {
    await deleteColaborations(playlistId, userId, authenticatedUserId);
    return h.response({
      status: 'success',
      message: 'Collaboration deleted successfully',
    }).code(200);
  } catch (err) {
    const statusCode = err.message === 'Playlist not found' || err.message === 'Collaboration not found' ? 404 : 403;
    return h.response({
      status: 'fail',
      message: err.message,
    }).code(statusCode);
  }
};

module.exports = {
  addCollaborator,
  deleteCollaborations,
};

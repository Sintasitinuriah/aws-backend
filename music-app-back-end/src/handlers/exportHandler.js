/* eslint-disable linebreak-style */
const Joi = require('joi');
const db = require('../config/database');
const { exportPlaylist } = require('../controllers/exportController');

const ExportPlaylistPayloadSchema = Joi.object({
  targetEmail: Joi.string().email({ tlds: true }).required(),
});

const exportPlaylistHandler = async (request, h) => {
  const { error } = ExportPlaylistPayloadSchema.validate(request.payload);
  if (error) {
    return h.response({
      status: 'fail',
      message: error.details[0].message,
    }).code(400);
  }

  try {
    const { targetEmail } = request.payload;
    const { userId } = request.auth.credentials;
    const { playlistId } = request.params;
    /* eslint-disable indent */
    const query = {
        text: 'SELECT id, owner FROM "Playlists" WHERE id = $1 AND (owner = $2 OR EXISTS (SELECT 1 FROM "Collaborations" WHERE playlist_id = $1 AND user_id = $2))',
        values: [playlistId, userId],
    };

    if (!playlistId || !userId) {
        return h.response({
          status: 'fail',
          message: 'Parameter tidak valid',
        }).code(400);
    }

      const playlist = await db.oneOrNone(query);
      if (!playlist) {
        const isOwner = await db.oneOrNone('SELECT id FROM "Playlists" WHERE id = $1', [playlistId]);
        if (isOwner) {
          return h.response({
            status: 'fail',
            message: 'You do not have permission to modify this playlist',
          }).code(403);
        }
        return h.response({
          status: 'fail',
          message: 'Playlist tidak ditemukan',
        }).code(404);
    }

    const result = await exportPlaylist(playlistId, userId, targetEmail);

    return h.response(result).code(201);
  } catch (err) {
    return h.response({
      status: 'fail',
      message: err.message,
    }).code(500);
  }
};

module.exports = { exportPlaylistHandler };

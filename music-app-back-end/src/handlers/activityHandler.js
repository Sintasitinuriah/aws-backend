/* eslint-disable linebreak-style */
const Joi = require('joi');
const db = require('../config/database');

// Menampilkan Activity
const getPlaylistActivity = async (request, h) => {
  const schema = Joi.object({
    playlistId: Joi.string().pattern(/^playlist-[A-Za-z0-9]{11}$/).required(),
  });

  const { error } = schema.validate(request.params);
  if (error) {
    const isInvalidFormat = error.details.some((details) => details.message.includes('pattern') || details.message.includes('format'));

    if (isInvalidFormat) {
      return h.response({
        status: 'fail',
        message: 'Format playlistId tidak valid',
      }).code(404);
    }
    return h.response({
      status: 'fail',
      message: 'Invalid playlistId format',
    }).code(400);
  }

  const { playlistId } = request.params;
  const authenticatedUserId = request.auth.credentials.userId;

  try {
    const playlist = await db.oneOrNone('SELECT id, owner FROM "Playlists" WHERE id = $1', [playlistId]);
    if (!playlist) {
      return h.response({
        status: 'fail',
        message: 'Playlist tidak ditemukan',
      }).code(404);
    }

    if (playlist.owner !== authenticatedUserId) {
      return h.response({
        status: 'fail',
        message: 'You do not have permission to modify this playlist',
      }).code(403);
    }

    // Ambil aktivitas terkait playlist dari tabel Activities
    const activities = await db.any(
      `SELECT 
          la.id, 
          u.username AS user_name, 
          s.title AS song_title, 
          la.action, 
          la.time 
      FROM 
          "LogActivity" la
      JOIN 
          users u ON la.user_id = u.id
      JOIN 
          "Songs" s ON la.song_id = s.id
      WHERE 
          la.playlist_id = $1
      ORDER BY 
          la.time ASC;
`,
      [playlistId],
    );

    const limit = 3;
    const limitedActivity = activities.slice(0, limit);

    return h.response({
      status: 'success',
      data: {
        playlistId,
        activities: limitedActivity.map((activity) => ({
          username: activity.user_name,
          title: activity.song_title,
          action: activity.action,
          time: activity.time,
        })),
      },
    }).code(200);
  } catch (err) {
    console.error('Error in getPlaylistActivity handler:', err);
    return h.response({
      status: 'fail',
      message: 'Server error occurred',
    }).code(500);
  }
};

module.exports = {
  getPlaylistActivity,
};

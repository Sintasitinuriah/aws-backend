/* eslint-disable linebreak-style */
/* eslint-disable no-undef */
/* eslint-disable object-curly-newline */

// handlers/playlistHandler.js
const Joi = require('joi');
const db = require('../config/database');
const { createPlaylist, deletePlaylist, getUserPlaylists, addSongToPlaylist, deleteSongFromPlaylist, getUserPlaylistsWithSongs } = require('../controllers/playlistController');
const { addPlaylistActivities } = require('../controllers/activityController');

// Handler untuk menambah playlist
const addPlaylistHandler = async (request, h) => {
  const schema = Joi.object({
    name: Joi.string().min(3).max(50).required(),
    playlistId: Joi.string().pattern(/^playlist-[A-Za-z0-9]{11}$/).optional(),
  });

  const { error } = schema.validate(request.payload);
  if (error) {
    return h.response({
      status: 'fail',
      message: error.details[0].message,
    }).code(400);
  }
  try {
    const { name } = request.payload;
    const { userId } = request.auth.credentials;
    const newPlaylist = await createPlaylist(name, userId);
    return h.response({
      status: 'success',
      message: 'Playlist created successfully',
      data: {
        playlistId: newPlaylist.id,
      },
    }).code(201);
  } catch (err) {
    return h.response({
      status: 'fail',
      message: err.message,
    }).code(err.statusCode || 500);
  }
};

// Handler untuk menghapus playlist
// eslint-disable-next-line consistent-return
const deletePlaylistHandler = async (request, h) => {
  try {
    const playlistId = request.params.id;
    const { userId } = request.auth.credentials;

    const playlist = await db.oneOrNone(
      'SELECT id FROM "Playlists" WHERE id = $1 AND owner = $2',
      [playlistId, userId],
    );

    if (!playlist) {
      return h.response({
        status: 'fail',
        message: 'You do not have permission to modify this playlist',
      }).code(403);
    }

    const deletePlaylists = await deletePlaylist(playlistId, userId);
    if (!deletePlaylists) {
      return h.response({
        status: 'fail',
        message: 'Playlist tidak ditemukan',
      }).code(404);
    }

    return h.response({
      status: 'success',
      message: 'Playlist berhasil dihapus',
    }).code(200);
  } catch (err) {
    return h.response({
      status: 'fail',
      message: err.message,
    }).code(err.statusCode || 500);
  }
};

// Handler untuk mendapatkan semua playlist milik user
const getUserPlaylistsHandler = async (request, h) => {
  try {
    let { limit = 2 } = request.query;
    const { userId } = request.auth.credentials;

    // Pastikan limit adalah angka positif
    limit = Math.max(1, Number(limit));

    const playlists = await getUserPlaylists(userId, limit);

    const formattedPlaylists = playlists.map((playlist) => ({
      id: playlist.id,
      name: playlist.name,
      username: playlist.username,
    }));

    return h.response({
      status: 'success',
      data: {
        playlists: formattedPlaylists,
      },
    }).code(200);
  } catch (err) {
    console.error('Error fetching playlists:', err);
    return h.response({
      status: 'fail',
      message: 'Tidak dapat mengambil playlist. Silakan coba lagi.',
    }).code(500);
  }
};

const displayAndAddSongToPlaylistHandler = async (request, h) => {
  const schema = Joi.object({
    playlistId: Joi.string().pattern(/^playlist-[A-Za-z0-9]{11}$/).optional(),
    songId: Joi.string().pattern(/^song-[A-Za-z0-9]{14}$/).required(),
  });

  // Validate the request payload
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

  const { userId } = request.auth.credentials;
  const { songId } = request.payload;
  const { playlistId } = request.params;

  try {
    console.log('Starting to process request:', { userId, playlistId, songId });

    const playlist = await db.oneOrNone(
      'SELECT id FROM "Playlists" WHERE id = $1 AND (owner = $2 OR EXISTS (SELECT 1 FROM "Collaborations" WHERE playlist_id = $1 AND user_id = $2))',
      [playlistId, userId],
    );

    console.log('Query playlist result:', playlist);

    if (!playlist) {
      return h.response({
        status: 'fail',
        message: 'You do not have permission to modify this playlist',
      }).code(403);
    }

    if (playlistId && songId) {
      console.log('Adding song to playlist:', { playlistId, songId });

      const addedSong = await addSongToPlaylist(playlistId, songId);

      console.log('Song added to playlist:', addedSong);

      const action = 'add';
      const time = new Date().toISOString();
      await addPlaylistActivities(playlistId, userId, songId, action, time);

      return h.response({
        status: 'success',
        message: 'Song has been added to the playlist',
        data: addedSong,
      }).code(201);
    }

    console.log('Fetching playlists for user:', userId);

    const playlists = await getUserPlaylists(userId);
    return h.response({
      status: 'success',
      data: playlists,
    }).code(200);
  } catch (err) {
    console.error('Error occurred:', err);

    const statusCode = err.statusCode || 500;
    const message = statusCode === 500 ? 'Internal Server Error' : err.message;

    return h.response({
      status: 'fail',
      message,
    }).code(statusCode);
  }
};

const getUserPlaylistsWithSongsHandler = async (request, h) => {
  const schema = Joi.object({
    playlistId: Joi.string().pattern(/^playlist-[A-Za-z0-9]{11}$/).required(),
  });

  // Validasi payload request
  const { error } = schema.validate(request.params);
  if (error) {
    return h.response({
      status: 'fail',
      message: 'Format playlistId tidak valid',
    }).code(400);
  }

  const { playlistId } = request.params;
  const { userId } = request.auth.credentials;
  const query = {
    text: 'SELECT id, owner FROM "Playlists" WHERE id = $1 AND (owner = $2 OR EXISTS (SELECT 1 FROM "Collaborations" WHERE playlist_id = $1 AND user_id = $2))',
    values: [playlistId, userId],
  };

  try {
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

    // Ambil detail playlist dan lagu-lagunya
    const playlistDetails = await getUserPlaylistsWithSongs(playlistId, userId);

    if (!playlistDetails) {
      return h.response({
        status: 'fail',
        message: 'Playlist tidak ditemukan',
      }).code(404);
    }
    const songs = playlistDetails.songs.map((song) => ({
      id: song.id,
      title: song.title,
      performer: song.performer,
    }));
    if (songs.length === 0) {
      return h.response({
        status: 'fail',
        message: 'Tidak ada lagu dalam playlist ini',
      }).code(404);
    }

    return h.response({
      status: 'success',
      data: {
        playlist: {
          id: playlistDetails.playlist_id,
          name: playlistDetails.playlist_name,
          username: playlistDetails.username,
          songs,
        },
      },
    }).code(200);
  } catch (err) {
    console.error('Error fetching playlist details:', err);
    return h.response({
      status: 'error',
      message: 'Internal Server Error',
    }).code(500);
  }
};

// Handle hapus playlists
const deleteSongFromPlaylistHandler = async (request, h) => {
  const schema = Joi.object({
    playlistId: Joi.string().pattern(/^playlist-[A-Za-z0-9]{11}$/).optional(),
    songId: Joi.string().pattern(/^song-[A-Za-z0-9]{14}$/).required(),
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
  try {
    const { playlistId } = request.params;
    const { userId } = request.auth.credentials;
    const { songId } = request.payload;
    const playlist = await db.oneOrNone(
      'SELECT id FROM "Playlists" WHERE id = $1 AND (owner = $2 OR EXISTS (SELECT 1 FROM "Collaborations" WHERE playlist_id = $1 AND user_id = $2))',
      [playlistId, userId],
    );
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

    const deleted = await deleteSongFromPlaylist(playlistId, songId);

    if (!deleted) {
      return h.response({
        status: 'fail',
        message: 'Song not found in playlist',
      }).code(404);
    }

    const action = 'delete';
    const time = new Date().toISOString();
    await addPlaylistActivities(playlistId, userId, songId, action, time);
    return h.response({
      status: 'success',
      message: 'Song removed from playlist',
    }).code(200);
  } catch (err) {
    return h.response({
      status: 'fail',
      message: err.message,
    }).code(err.statusCode || 500);
  }
};

module.exports = {
  addPlaylistHandler,
  deletePlaylistHandler,
  getUserPlaylistsHandler,
  displayAndAddSongToPlaylistHandler,
  deleteSongFromPlaylistHandler,
  getUserPlaylistsWithSongsHandler,
};

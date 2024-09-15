/* eslint-disable linebreak-style */
/* eslint-disable no-plusplus */
/* eslint-disable no-undef */
const Joi = require('joi');
const db = require('../config/database');

// Fungsi untuk generate ID play
const generatePlaylistId = () => {
  const chars = 'ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789';
  let result = 'playlist-';
  for (let i = 0; i < 11; i++) {
    result += chars.charAt(Math.floor(Math.random() * chars.length));
  }
  return result;
};

const generatePlaylistSongId = () => {
  const chars = 'ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789';
  let result = 'playlist-song-';
  for (let i = 0; i < 6; i++) {
    result += chars.charAt(Math.floor(Math.random() * chars.length));
  }
  return result;
};

// playload validation
const validatePlaylistPayload = (payload) => {
  const schema = Joi.object({
    name: Joi.string().min(3).max(50).required(),
  });
  return schema.validate(payload);
};

// Membuat playlist baru
const createPlaylist = async (name, userId) => {
  const { error } = validatePlaylistPayload({ name });
  if (error) {
    throw new Error(error.details[0].message);
  }

  try {
    const newId = generatePlaylistId();
    const query = {
      text: 'INSERT INTO "Playlists" (id, name, owner) VALUES ($1, $2, $3) RETURNING *',
      values: [newId, name, userId],
    };
    const newPlaylist = await db.one(query);
    return newPlaylist;
  } catch (err) {
    console.error('Error creating playlist:', err);
    throw err;
  }
};

// Menghapus playlist berdasarkan ID
const deletePlaylist = async (playlistId, userId) => {
  try {
    const result = await db.result('DELETE FROM "Playlists" WHERE id = $1 AND owner = $2', [playlistId, userId]);
    console.log('Hapus Query', result);
    if (result.rowCount === 0) {
      return 'Playlist Dihapus';
    }
    return 'Playlist Tidak Ditemukan';
  } catch (err) {
    console.error('Error deleting playlist:', err);
    throw err;
  }
};

// Mengambil semua playlist milik user tertentu
const getUserPlaylists = async (userId, limit = 2) => {
  try {
    const query = {
      text: `
        SELECT DISTINCT "Playlists".id, 
                        "Playlists".name, 
                        users.username, 
                        "Collaborations".id AS collaboration_id
        FROM "Playlists"
        JOIN users ON "Playlists".owner = users.id
        LEFT JOIN "Collaborations" ON "Playlists".id = "Collaborations".playlist_id
        WHERE "Playlists".owner = $1
           OR "Collaborations".user_id = $1
        LIMIT $2`,
      values: [userId, limit],
    };

    const playlists = await db.any(query);
    return playlists;
  } catch (err) {
    console.error('Error fetching user playlists:', err);
    throw err;
  }
};

const addSongToPlaylist = async (playlistId, songId) => {
  try {
    // Tambahkan lagu ke playlist
    const newId = generatePlaylistSongId();
    const newEntry = await db.one(
      'INSERT INTO "Playlists_songs" (id, playlist_id, song_id) VALUES ($1, $2, $3) RETURNING *',
      [newId, playlistId, songId],
    );
    return newEntry;
  } catch (err) {
    console.error('Error adding song to playlist:', err);
    throw err;
  }
};

// Get the playlist with Song
const getUserPlaylistsWithSongs = async (playlistId, userId) => {
  try {
    const query = {
      text: `
        SELECT 
          "Playlists".id AS playlist_id, 
          "Playlists".name AS playlist_name, 
          users.username, 
          json_agg(json_build_object('id', "Songs".id, 'title', "Songs".title, 'performer', "Songs".performer)) AS songs
        FROM "Playlists"
        JOIN users ON "Playlists".owner = users.id
        LEFT JOIN "Playlists_songs" ON "Playlists".id = "Playlists_songs".playlist_id
        LEFT JOIN "Songs" ON "Playlists_songs".song_id = "Songs".id
        WHERE "Playlists".id = $1
          AND ("Playlists".owner = $2 
            OR EXISTS (SELECT 1 FROM "Collaborations" WHERE playlist_id = $1 AND user_id = $2))
        GROUP BY "Playlists".id, users.username`,
      values: [playlistId, userId],
    };

    const playlistDetails = await db.oneOrNone(query);

    if (!playlistDetails) {
      console.log('No details found for playlistId:', playlistId);
      return null; // Or handle this case as needed, such as returning an error response
    }

    return playlistDetails;
  } catch (err) {
    console.error('Error fetching playlist details:', err);
    throw err;
  }
};

// Delete a song in playlists
const deleteSongFromPlaylist = async (playlistId, songId) => {
  try {
    const result = await db.result('DELETE FROM "Playlists_songs" WHERE playlist_id = $1 AND song_id = $2', [playlistId, songId]);
    return result.rowCount > 0;
  } catch (err) {
    console.error('Error deleting song from playlist:', err);
    throw err;
  }
};

module.exports = {
  createPlaylist,
  deletePlaylist,
  getUserPlaylists,
  addSongToPlaylist,
  deleteSongFromPlaylist,
  getUserPlaylistsWithSongs,
};

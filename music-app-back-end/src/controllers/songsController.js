/* eslint-disable no-plusplus */
/* eslint-disable max-len */
const Joi = require('joi');
const db = require('../config/database');

// Fungsi untuk generate ID lagu
const generateSongId = () => {
  const chars = 'ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789';
  let result = 'song-';
  for (let i = 0; i < 14; i++) {
    result += chars.charAt(Math.floor(Math.random() * chars.length));
  }
  return result;
};

const validateSongPayload = (payload) => {
  const schema = Joi.object({
    title: Joi.string().min(3).required(),
    year: Joi.number().integer().min(1900).required(),
    genre: Joi.string().min(3).max(50).required(),
    performer: Joi.string().min(3).required(),
    duration: Joi.number().integer().optional(),
    albumId: Joi.string().pattern(/^album-[A-Za-z0-9]{14}$/).optional(),
  });
  return schema.validate(payload);
};

// Create Song
const createSong = async (payload) => {
  const { error, value } = validateSongPayload(payload);
  if (error) {
    throw new Error(error.details[0].message);
  }

  try {
    const newId = generateSongId();
    const newSong = await db.one(
      'INSERT INTO "Songs" (id, title, year, genre, performer, duration, "albumId") VALUES ($1, $2, $3, $4, $5, $6, $7) RETURNING *',
      [newId, value.title, value.year, value.genre, value.performer, value.duration, value.albumId],
    );
    return newSong;
  } catch (err) {
    console.error('Database Error:', err.message);
    throw new Error('Failed to create song');
  }
};

// Get Song by ID
const getSongById = async (id) => {
  try {
    const idSchema = Joi.string().pattern(/^song-[A-Za-z0-9]{14}$/).required(); // Format ID baru dengan panjang total 20 karakter
    await idSchema.validateAsync(id);

    const song = await db.oneOrNone('SELECT * FROM "Songs" WHERE id = $1', [id]);
    if (song) {
      return song;
    }
    throw new Error('Musik tidak ditemukan');
  } catch (err) {
    console.error('Validation or Database Error:', err.message);
    throw new Error('Invalid ID');
  }
};

// Get All Songs
const getAllSongs = async (query) => {
  try {
    let sql = 'SELECT id, title, performer FROM "Songs"';
    const conditions = [];
    const values = [];

    if (query.title) {
      conditions.push(`title ILIKE $${values.length + 1}`);
      values.push(`%${query.title}%`);
    }
    if (query.performer) {
      conditions.push(`performer ILIKE $${values.length + 1}`);
      values.push(`%${query.performer}%`);
    }

    if (conditions.length > 0) {
      sql += ` WHERE ${conditions.join(' AND ')}`;
    }

    const songs = await db.any(sql, values);
    return songs;
  } catch (err) {
    console.error('Database Error:', err.message);
    throw new Error('Gagal untuk mendapatkan musik');
  }
};

// Get Songs by Album ID
const getSongsByAlbumId = async (albumId) => {
  try {
    const songs = await db.any('SELECT * FROM "Songs" WHERE "albumId" = $1', [albumId]);
    return songs;
  } catch (err) {
    console.error('Database Error:', err.message);
    throw new Error('Gagal mendapatkan musik pada album');
  }
};

// Update Song
const updateSong = async (id, payload) => {
  try {
    const result = await db.result(
      'UPDATE "Songs" SET title = $1, year = $2, genre = $3, performer = $4, duration = $5, "albumId" = $6 WHERE id = $7 RETURNING *',
      [payload.title, payload.year, payload.genre, payload.performer, payload.duration, payload.albumId, id],
    );

    if (result.rowCount > 0) {
      return result.rows[0];
    }
    throw new Error('Musik tidak ditemukan');
  } catch (err) {
    console.error('Database Error:', err.message);
    throw err;
  }
};

// Delete Song
const deleteSong = async (id) => {
  try {
    const result = await db.result('DELETE FROM "Songs" WHERE id = $1', [id]);

    if (result.rowCount > 0) {
      return 'Musik dihapus';
    }
    return 'Musik tidak ditemukan';
  } catch (err) {
    console.error('Database Error:', err.message);
    throw new Error('Database operation failed');
  }
};

module.exports = {
  createSong,
  getSongById,
  getAllSongs,
  getSongsByAlbumId,
  updateSong,
  deleteSong,
};

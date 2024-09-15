/* eslint-disable linebreak-style */
/* eslint-disable no-plusplus */
/* eslint-disable linebreak-style */
const Joi = require('joi');
const db = require('../config/database');

// Fungsi untuk generate ID album dengan panjang total 20 karakter
const generateAlbumId = () => {
  const chars = 'ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789';
  let result = 'album-';
  for (let i = 0; i < 14; i++) {
    result += chars.charAt(Math.floor(Math.random() * chars.length));
  }
  return result;
};

// Validasi payload untuk Create
const validatePayload = (payload) => {
  const schema = Joi.object({
    name: Joi.string().min(3).required(),
    year: Joi.number().integer().min(1900).required(),
  });
  return schema.validate(payload);
};

// Create Album
const createAlbum = async (payload) => {
  const { error, value } = validatePayload(payload);
  if (error) {
    const err = new Error(error.details[0].message);
    err.statusCode = 400;
    throw err;
  }

  try {
    const newId = generateAlbumId();
    const newAlbum = await db.one(
      'INSERT INTO "Albums" (id, name, year) VALUES ($1, $2, $3) RETURNING *',
      [newId, value.name, value.year],
    );
    return newAlbum;
  } catch (err) {
    console.error('Database Error:', err.message);
    throw new Error('Gagal menambahkan album');
  }
};

// Get Album by ID
const getAlbumById = async (id) => {
  try {
    const album = await db.oneOrNone('SELECT * FROM "Albums" WHERE id = $1', [id]);
    if (!album) {
      const err = new Error('Album tidak ditemukan');
      err.statusCode = 404;
      throw err;
    }
    return album;
  } catch (err) {
    console.error('Database Error:', err.message);
    if (err.statusCode === 404) {
      throw err;
    }
    throw new Error('Failed to get album');
  }
};

// Update Album
const updateAlbum = async (id, payload) => {
  try {
    const idSchema = Joi.string().pattern(/^album-[A-Za-z0-9]{14}$/).required();
    await idSchema.validateAsync(id);

    const payloadSchema = Joi.object({
      name: Joi.string().min(3),
      year: Joi.number().integer().min(1900),
    }).min(1);

    const { error } = payloadSchema.validate(payload);
    if (error) {
      const err = new Error(error.details[0].message);
      err.statusCode = 400;
      throw err;
    }

    const result = await db.result(
      'UPDATE "Albums" SET name = $1, year = $2 WHERE id = $3 RETURNING *',
      [payload.name, payload.year, id],
    );

    if (result.rowCount > 0) {
      return result.rows[0];
    }
    const err = new Error('Album tidak ditemukan');
    err.statusCode = 404;
    throw err;
  } catch (err) {
    console.error('Validation or Database Error:', err.message);
    throw err;
  }
};

// Delete Album
const deleteAlbum = async (id) => {
  const idSchema = Joi.string().pattern(/^album-[A-Za-z0-9]{14}$/).required();
  await idSchema.validateAsync(id);

  const result = await db.result('DELETE FROM "Albums" WHERE id = $1', [id]);
  if (result.rowCount > 0) {
    return 'Album deleted successfully';
  }
  throw new Error('Album tidak ditemukan'); // Throw error with specific message
};

module.exports = {
  createAlbum,
  getAlbumById,
  updateAlbum,
  deleteAlbum,
};

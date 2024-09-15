/* eslint-disable linebreak-style */
const Joi = require('joi');
const songsController = require('../controllers/songsController');

// handle create song
const createSong = async (request, h) => {
  const schema = Joi.object({
    title: Joi.string().min(3).required(),
    year: Joi.number().integer().min(1900).required(),
    genre: Joi.string().required(),
    performer: Joi.string().required(),
    duration: Joi.number().integer().optional(),
    albumId: Joi.string().pattern(/^album-[A-Za-z0-9]{14}$/).optional(),
  });

  const { error } = schema.validate(request.payload);
  if (error) {
    return h.response({
      status: 'fail',
      message: error.details[0].message,
    }).code(400);
  }

  try {
    const newSong = await songsController.createSong(request.payload);
    return h.response({
      status: 'success',
      message: 'Musik berhasil ditambahkan',
      data: {
        songId: newSong.id,
      },
    }).code(201);
  } catch (err) {
    console.error('Handler Error:', err.message);
    const statusCode = err.statusCode || 500;

    return h.response({
      status: statusCode === 404 ? 'fail' : 'error',
      message: err.message || 'Maaf, Terjadi kesalahan pada server',
    }).code(statusCode);
  }
};

// handle get song by id
const getSongById = async (request, h) => {
  try {
    const { id } = request.params;
    const song = await songsController.getSongById(id);

    if (!song) {
      return h.response({
        status: 'fail',
        message: 'Musik tidak ditemukan',
      }).code(404);
    }

    return h.response({
      status: 'success',
      data: {
        song: {
          id: song.id,
          title: song.title,
          year: song.year,
          performer: song.performer,
          genre: song.genre,
          duration: song.duration,
          albumId: song.albumId,
        },
      },
    }).code(200);
  } catch (err) {
    if (err.message === 'Invalid ID') {
      return h.response({
        status: 'fail',
        message: 'ID tidak valid',
      }).code(404);
    }

    // Jika kesalahan terkait tidak ditemukan, kembalikan respons 404
    if (err.message === 'Musik tidak ditemukan') {
      return h.response({
        status: 'fail',
        message: 'Musik tidak ditemukan',
      }).code(404);
    }

    return h.response({
      status: 'error',
      message: 'Terjadi kesalahan pada server',
    }).code(500);
  }
};

// handle get all songs
const getAllSongs = async (request, h) => {
  try {
    // proses pencarian
    const { query } = request;
    let limit = 2;
    if (query.title && query.performer) {
      limit = 1;
    }

    const songs = await songsController.getAllSongs(query);
    const limitedSongs = songs.slice(0, limit);

    if (limitedSongs.length === 0) {
      return h.response({
        status: 'fail',
        message: 'Musik tidak ditemukan',
      }).code(404);
    }

    const formattedSongs = limitedSongs.map((song) => ({
      id: song.id,
      title: song.title,
      performer: song.performer,
    }));

    return h.response({
      status: 'success',
      data: {
        songs: formattedSongs,
      },
    }).code(200);
  } catch (err) {
    console.error('Handler Error:', err.message);
    return h.response({
      status: 'error',
      message: 'Maaf, Terjadi Kesalahan pada server',
    }).code(500);
  }
};
// Handle updates
const updateSong = async (request, h) => {
  try {
    const idSchema = Joi.string().pattern(/^song-[A-Za-z0-9]{14}$/).required();
    const { error: idError } = idSchema.validate(request.params.id);
    if (idError) {
      return h.response({
        status: 'fail',
        message: 'ID tidak valid',
      }).code(404);
    }

    // Validasi payload di handler
    const songSchema = Joi.object({
      title: Joi.string().min(3).required(),
      year: Joi.number().integer().min(1900).required(),
      genre: Joi.string().min(3).max(50).required(),
      performer: Joi.string().min(3).required(),
      duration: Joi.number().integer().optional(),
      albumId: Joi.string().pattern(/^album-[A-Za-z0-9]{14}$/).optional(),
    });

    const { error: payloadError, value } = songSchema.validate(request.payload);
    if (payloadError) {
      return h.response({
        status: 'fail',
        message: payloadError.details[0].message,
      }).code(400);
    }
    const updatedSong = await songsController.updateSong(request.params.id, value);
    if (!updatedSong) {
      return h.response({
        status: 'fail',
        message: 'Musik tidak ditemukan',
      }).code(404);
    }

    return h.response({
      status: 'success',
      message: 'Musik berhasil diubah',
      data: {
        id: updatedSong.id,
      },
    }).code(200);
  } catch (err) {
    console.error('Handler Error:', err.message);
    return h.response({
      status: 'error',
      message: 'Terjadi kesalahan pada server',
    }).code(500);
  }
};

// handle delete song
const deleteSong = async (request, h) => {
  try {
    const idSchema = Joi.string().pattern(/^song-[A-Za-z0-9]{14}$/).required();
    const { error } = idSchema.validate(request.params.id);

    if (error) {
      return h.response({
        status: 'fail',
        message: 'Invalid ID format',
      }).code(404);
    }

    // Jika validasi berhasil, lanjutkan dengan memanggil controller
    const message = await songsController.deleteSong(request.params.id);

    if (message === 'Musik tidak ditemukan') {
      return h.response({
        status: 'fail',
        message,
      }).code(404);
    }

    return h.response({
      status: 'success',
      message,
    }).code(200);
  } catch (err) {
    return h.response({
      status: 'error',
      message: 'Maaf, Terjadi Kesalahan pada server',
    }).code(500);
  }
};

module.exports = {
  createSong,
  getSongById,
  getAllSongs,
  updateSong,
  deleteSong,
};

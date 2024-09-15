const Joi = require('joi');
const albumsController = require('../controllers/albumsController');
const songsController = require('../controllers/songsController');

// handle create album
const createAlbum = async (request, h) => {
  const schema = Joi.object({
    name: Joi.string().min(3).required(),
    year: Joi.number().integer().min(1900).required(),
  });

  const { error } = schema.validate(request.payload);
  if (error) {
    return h.response({
      status: 'fail',
      message: error.details[0].message,
    }).code(400);
  }

  try {
    const newAlbum = await albumsController.createAlbum(request.payload);
    return h.response({
      status: 'success',
      message: 'Album berhasil ditambahkan',
      data: {
        albumId: newAlbum.id,
      },
    }).code(201);
  } catch (err) {
    const statusCode = err.statusCode || 500;

    return h.response({
      status: statusCode === 404 ? 'fail' : 'error',
      message: err.message || 'Terjadi kesalahan pada server',
    }).code(statusCode);
  }
};

// Get Album by ID
const getAlbumById = async (request, h) => {
  try {
    const { id } = request.params;

    const idSchema = Joi.string().pattern(/^album-[A-Za-z0-9]{14}$/).required();
    const { error } = idSchema.validate(id);

    if (error) {
      return h.response({
        status: 'fail',
        message: 'Invalid format ID',
      }).code(404);
    }

    const album = await albumsController.getAlbumById(id);
    const songs = await songsController.getSongsByAlbumId(id);

    return h.response({
      status: 'success',
      data: {
        album: {
          id: album.id,
          name: album.name,
          year: album.year,
          songs: songs.map((song) => ({
            id: song.id,
            title: song.title,
            performer: song.performer,
          })),
        },
      },
    }).code(200);
  } catch (err) {
    if (err.message === 'Album tidak ditemukan') {
      return h.response({
        status: 'fail',
        message: 'Album tidak ditemukan',
      }).code(404);
    }

    return h.response({
      status: 'error',
      message: 'Maaf, Terjadi kesalahan pada server',
    }).code(500);
  }
};

// Update Album
const updateAlbum = async (request, h) => {
  try {
    const idSchema = Joi.string().pattern(/^album-[A-Za-z0-9]{14}$/).required();
    const { error: idError } = idSchema.validate(request.params.id);

    if (idError) {
      return h.response({
        status: 'fail',
        message: 'Album tidak ditemukan',
      }).code(404);
    }

    const payloadSchema = Joi.object({
      name: Joi.string().min(3).required(),
      year: Joi.number().integer().min(1900).required(),
    });

    const { error: payloadError } = payloadSchema.validate(request.payload);

    if (payloadError) {
      return h.response({
        status: 'fail',
        message: payloadError.details[0].message,
      }).code(400);
    }

    const updatedAlbum = await albumsController.updateAlbum(request.params.id, request.payload);

    if (!updatedAlbum) {
      return h.response({
        status: 'fail',
        message: 'Album tidak ditemukan',
      }).code(404);
    }

    return h.response({
      status: 'success',
      message: 'Album berhasil diubah',
      data: {
        id: updatedAlbum.id,
      },
    }).code(200);
  } catch (err) {
    return h.response({
      status: 'error',
      message: 'Maaf, Terjadi kesalahan pada server',
    }).code(500);
  }
};

// Delete Album
const deleteAlbum = async (request, h) => {
  try {
    const { id } = request.params;

    const idSchema = Joi.string().pattern(/^album-[A-Za-z0-9]{14}$/).required();
    const { error } = idSchema.validate(id);

    if (error) {
      return h.response({
        status: 'fail',
        message: 'Invalid format ID',
      }).code(404);
    }

    const result = await albumsController.deleteAlbum(id);

    return h.response({
      status: 'success',
      message: result,
    }).code(200);
  } catch (err) {
    if (err.message === 'Album tidak ditemukan') {
      return h.response({
        status: 'fail',
        message: 'Album tidak ditemukan',
      }).code(404);
    }

    return h.response({
      status: 'error',
      message: 'Maaf, Terjadi Kesalahan pada server',
    }).code(500);
  }
};

module.exports = {
  createAlbum,
  getAlbumById,
  updateAlbum,
  deleteAlbum,
};

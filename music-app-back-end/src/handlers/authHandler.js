/* eslint-disable linebreak-style */
// handlers/authHandler.js

const Joi = require('joi');
const authController = require('../controllers/authController');

// Schema Validasi dengan Joi
const loginSchema = Joi.object({
  username: Joi.string().required().messages({
    'string.empty': 'Username tidak boleh kosong',
    'any.required': 'Username wajib diisi',
  }),
  password: Joi.string().required().messages({
    'string.empty': 'Password tidak boleh kosong',
    'any.required': 'Password wajib diisi',
  }),
});

const refreshTokenSchema = Joi.object({
  refreshToken: Joi.string().required(),
});

const loginHandler = async (request, h) => {
  const { username, password } = request.payload;

  // Validasi payload menggunakan Joi
  const { error } = loginSchema.validate({ username, password }, { abortEarly: false });

  if (error) {
    // Kustomisasi pesan error berdasarkan validasi Joi
    const customErrorMessage = error.details.map((detail) => detail.message).join(', ');
    return h.response({
      status: 'fail',
      message: customErrorMessage,
    }).code(400);
  }

  try {
    // Panggil fungsi loginUser dari controller
    const tokens = await authController.loginUser(username, password);

    return h.response({
      status: 'success',
      data: tokens,
    }).code(201);
  } catch (err) {
    // Log the error for debugging
    console.error('Error in loginHandler:', err);

    // Tangani kesalahan autentikasi dengan pesan khusus
    if (err.message === 'UserNotFound') {
      return h.response({
        status: 'fail',
        message: 'Username tidak ditemukan',
      }).code(401);
    }
    if (err.message === 'InvalidPassword') {
      return h.response({
        status: 'fail',
        message: 'Password salah',
      }).code(401);
    }
    // Tangani kesalahan lainnya dengan status kode 500
    return h.response({
      status: 'fail',
      message: 'Terjadi kesalahan pada server, silakan coba lagi nanti',
    }).code(500);
  }
};

// Logout Handler
const logoutHandler = async (request, h) => {
  const { refreshToken } = request.payload;

  const { error } = refreshTokenSchema.validate({ refreshToken });
  if (error) {
    return h.response({ status: 'fail', message: error.details[0].message }).code(400);
  }

  try {
    await authController.logoutUser(refreshToken);
    return h.response({
      status: 'success',
      message: 'Logout berhasil',
    }).code(200);
  } catch (err) {
    return h.response({ status: 'fail', message: err.message }).code(err.statusCode || 500);
  }
};

// Refresh Token Handler
const refreshTokenHandler = async (request, h) => {
  const { refreshToken } = request.payload;
  // Log token yang diterima
  console.log('Received refreshToken:', refreshToken);

  // Validasi input
  const { error } = refreshTokenSchema.validate({ refreshToken });
  if (error) {
    console.log('Validation Error:', error.details);
    return h.response({
      status: 'fail',
      message: 'Invalid refresh token format.',
    }).code(400);
  }

  try {
    // Proses refresh token
    const newAccessToken = await authController.refreshAccessToken(refreshToken);
    console.log(newAccessToken);
    return h.response({
      status: 'success',
      data: {
        accessToken: newAccessToken,
      },
    }).code(200);
  } catch (err) {
    console.log('Error during token refresh:', err.message);
    if (err.message === 'InvalidRefreshToken') {
      return h.response({
        status: 'fail',
        message: 'Invalid refresh token.',
      }).code(400);
    }
    return h.response({
      status: 'fail',
      message: 'Terjadi kesalahan pada server, silakan coba lagi nanti',
    }).code(500);
  }
};

module.exports = {
  loginHandler,
  logoutHandler,
  refreshTokenHandler,
};

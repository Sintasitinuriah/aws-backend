/* eslint-disable linebreak-style */
/* eslint-disable no-use-before-define */
// controllers/authController.js

const bcrypt = require('bcrypt');
const jwt = require('jsonwebtoken');
const db = require('../config/database');

// Fungsi untuk menghasilkan Access Token
const generateAccessToken = (userId) => jwt.sign({ userId }, process.env.ACCESS_TOKEN_KEY, { expiresIn: '1h' });

// Fungsi untuk menghasilkan Refresh Token
const generateRefreshToken = (userId) => jwt.sign({ userId }, process.env.REFRESH_TOKEN_KEY, { expiresIn: '7d' });

// Login User
const loginUser = async (username, password) => {
  const user = await db.oneOrNone('SELECT id, password FROM users WHERE username = $1', [username]);
  if (!user) {
    throw new Error('UserNotFound');
  }

  const isPasswordValid = await bcrypt.compare(password, user.password);
  if (!isPasswordValid) {
    throw new Error('InvalidPassword');
  }

  const accessToken = generateAccessToken(user.id);
  const refreshToken = generateRefreshToken(user.id);

  // Simpan refresh token ke database menggunakan metode addRefreshToken
  await addRefreshToken(refreshToken);

  return { accessToken, refreshToken };
};

const addRefreshToken = async (token) => {
  try {
    const query = {
      text: 'INSERT INTO authentications (token) VALUES($1)',
      values: [token],
    };
    await db.none(query);
    console.log('Refresh token stored successfully:', token);
  } catch (err) {
    console.error('Error storing refresh token:', err);
    throw err;
  }
};

// Logout User
const logoutUser = async (refreshToken) => {
  const result = await db.result('DELETE FROM authentications WHERE token = $1', [refreshToken]);
  if (result.rowCount === 0) {
    const error = new Error('Refresh token tidak ditemukan');
    error.statusCode = 400;
    throw error;
  }
};

// Refresh Access Token
const refreshAccessToken = async (refreshToken) => {
  try {
    console.log('Received refreshToken:', refreshToken);

    // Verifikasi refresh token
    const decoded = jwt.verify(refreshToken, process.env.REFRESH_TOKEN_KEY);
    console.log('Decoded Token:', decoded);

    // Cek apakah token ada di database
    const tokenExists = await db.oneOrNone('SELECT * FROM authentications WHERE token = $1', [refreshToken]);
    console.log('Token Exists in DB:', tokenExists ? tokenExists.token : 'Token not found');

    if (!tokenExists) {
      throw new Error('InvalidRefreshToken');
    }

    // Generate new access token
    const newAccessToken = generateAccessToken(decoded.userId);
    console.log('Generated new accessToken:', newAccessToken);

    return newAccessToken;
  } catch (err) {
    console.error('Error during token refresh:', err);
    if (err.name === 'TokenExpiredError') {
      throw new Error('RefreshTokenExpired');
    }
    if (err.name === 'JsonWebTokenError') {
      throw new Error('InvalidRefreshToken');
    }
    throw err;
  }
};

module.exports = {
  loginUser,
  logoutUser,
  refreshAccessToken,
};

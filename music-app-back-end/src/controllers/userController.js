/* eslint-disable linebreak-style */
/* eslint-disable no-plusplus */

const Joi = require('joi');
const bcrypt = require('bcrypt');
const db = require('../config/database');

// Fungsi untuk generate ID album dengan panjang total 20 karakter
const generateUserId = () => {
  const chars = 'ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789';
  let result = 'user-';
  for (let i = 0; i < 14; i++) {
    result += chars.charAt(Math.floor(Math.random() * chars.length));
  }
  return result;
};

// Validate untuk pembuatan dan pembaruan User
const validateUserPayload = (payload) => {
  const schema = Joi.object({
    username: Joi.string().min(3).max(30).required(),
    password: Joi.string().min(6).required(),
    fullname: Joi.string().min(3).max(50).required(),
  });
  return schema.validate(payload);
};

// Create User
const createUser = async (payload) => {
  const { error, value } = validateUserPayload(payload);
  if (error) {
    const err = new Error(error.details[0].message);
    err.statusCode = 400;
    throw err;
  }

  try {
    const existingUser = await db.oneOrNone('SELECT id FROM "users" WHERE username = $1', [value.username]);
    if (existingUser) {
      const err = new Error('Username sudah terdaftar');
      err.statusCode = 400;
      throw err;
    }

    const newId = generateUserId();
    const hashedPassword = await bcrypt.hash(value.password, 10);
    const newUser = await db.one(
      'INSERT INTO "users" (id, username, password, fullname) VALUES ($1, $2, $3, $4) RETURNING *',
      [newId, value.username, hashedPassword, value.fullname],
    );

    return newUser;
  } catch (err) {
    console.error('Database Error:', err.message);
    err.statusCode = err.statusCode || 500;
    throw err;
  }
};

module.exports = {
  createUser,
};

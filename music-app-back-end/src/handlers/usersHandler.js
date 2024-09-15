/* eslint-disable linebreak-style */
/* eslint-disable no-unused-vars */
const Joi = require('joi');
const usersController = require('../controllers/userController');

// handle create user
const createUser = async (req, h, next) => {
  const schema = Joi.object({
    username: Joi.string().min(3).max(30).required(),
    password: Joi.string().min(6).required(),
    fullname: Joi.string().min(3).max(50).required(),
  });

  const { error } = schema.validate(req.payload);
  if (error) {
    return h.response({
      status: 'fail',
      message: error.details[0].message,
    }).code(400);
  }

  try {
    const newUser = await usersController.createUser(req.payload);
    return h.response({
      status: 'success',
      message: 'User berhasil ditambahkan',
      data: {
        userId: newUser.id,
      },
    }).code(201);
  } catch (err) {
    const statusCode = err.statusCode || 400;
    return h.response({
      status: 'fail',
      message: 'Username telah terdaftar',
    }).code(statusCode);
  }
};

module.exports = {
  createUser,
};

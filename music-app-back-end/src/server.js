/* eslint-disable no-unused-vars */
/* eslint-disable max-len */

require('dotenv').config();
const Hapi = require('@hapi/hapi');
const Jwt = require('@hapi/jwt');
const { connectRabbitMQ } = require('./config/rabbitMQ');

const albumsRoutes = require('./routes/albums');
const songsRoutes = require('./routes/songs');
const usersRoutes = require('./routes/users');
const authRoutes = require('./routes/auth');
const playlistRoutes = require('./routes/playlist');
const collabRoutes = require('./routes/colab');
const activityRoutes = require('./routes/activity');
const exportRoutes = require('./routes/export');

const init = async () => {
  const server = Hapi.server({
    port: 5000,
    host: 'localhost',
    routes: {
      cors: {
        origin: ['*'], // Sesuaikan dengan kebutuhan Anda
      },
    },
  });

  // Register JWT plugin
  await server.register(Jwt);

  // Define JWT authentication strategy
  server.auth.strategy('jwt', 'jwt', {
    keys: process.env.ACCESS_TOKEN_KEY,
    verify: {
      aud: false,
      iss: false,
      sub: false,
      maxAgeSec: 3600, // 1 hour
    },
    validate: (artifacts, request, h) => ({
      isValid: true,
      credentials: { userId: artifacts.decoded.payload.userId },
    }),
  });

  // connect to rabbitmq server
  await connectRabbitMQ();

  // Apply routes
  server.route(authRoutes);

  // Playlist Routes
  server.route(playlistRoutes);

  // Collaboration Routes
  server.route(collabRoutes);

  // Activity Routes
  server.route(activityRoutes);

  // Export Routes
  server.route(exportRoutes);

  // Albums Routes without authentication
  server.route(albumsRoutes.map((route) => ({ ...route, options: { ...route.options, auth: false } })));

  // Songs Routes without authentication
  server.route(songsRoutes.map((route) => ({ ...route, options: { ...route.options, auth: false } })));

  // Users Routes without authentication
  server.route(usersRoutes.map((route) => ({ ...route, options: { ...route.options, auth: false } })));

  await server.start();
  console.log(`Server running on ${server.info.uri}`);
};

process.on('unhandledRejection', (err) => {
  console.log(err);
  process.exit(1);
});

init();

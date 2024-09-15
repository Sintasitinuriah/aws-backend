/* eslint-disable linebreak-style */
const db = require('../config/database');

const generateColabId = () => {
  const chars = 'ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789';
  let result = 'colab-';
  // eslint-disable-next-line no-plusplus
  for (let i = 0; i < 14; i++) {
    result += chars.charAt(Math.floor(Math.random() * chars.length));
  }
  return result;
};

// Add a new Colaborations
const createColaborations = async (playlistId, userId) => {
  try {
    const newId = generateColabId();
    const query = {
      text: 'INSERT INTO "Collaborations" (id, playlist_id, user_id) VALUES ($1, $2, $3) RETURNING *',
      values: [newId, playlistId, userId],
    };
    const addColaborations = await db.one(query);
    console.log(addColaborations);
    return addColaborations;
  } catch (err) {
    console.error('Error creating collaborations:', err);
    throw err;
  }
};

// Delete Collaborations
const deleteColaborations = async (playlistId, userId, authenticatedUserId) => {
  const query = {
    text: 'SELECT id, owner FROM "Playlists" WHERE id = $1',
    values: [playlistId],
  };

  const playlist = await db.oneOrNone(query);

  if (!playlist) {
    throw new Error('Playlist not found');
  }

  if (playlist.owner !== authenticatedUserId) {
    throw new Error('You do not have permission to modify this playlist');
  }

  if (userId === authenticatedUserId) {
    throw new Error('Owner cannot remove themselves from the collaboration');
  }

  const deleteQuery = {
    text: 'DELETE FROM "Collaborations" WHERE playlist_id = $1 AND user_id = $2 RETURNING *',
    values: [playlistId, userId],
  };

  const deletedCollaboration = await db.oneOrNone(deleteQuery);

  if (!deletedCollaboration) {
    throw new Error('Collaboration not found');
  }

  return deletedCollaboration;
};

module.exports = {
  createColaborations,
  deleteColaborations,
};

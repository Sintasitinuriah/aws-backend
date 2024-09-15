/* eslint-disable linebreak-style */
// controllers/playlistActivitiesController.js
const db = require('../config/database');

const generatePlaylistActivityId = () => {
  const chars = 'ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789';
  let result = 'activity-';
  // eslint-disable-next-line no-plusplus
  for (let i = 0; i < 11; i++) {
    result += chars.charAt(Math.floor(Math.random() * chars.length));
  }
  return result;
};

// eslint-disable-next-line consistent-return
const addPlaylistActivities = async (playlistId, userId, songId, action, time) => {
  try {
    const newId = generatePlaylistActivityId();
    const query = {
      text: 'INSERT INTO "LogActivity" (id, playlist_id, user_id, song_id, action, time) VALUES ($1, $2, $3, $4, $5, $6) RETURNING *',
      values: [newId, playlistId, userId, songId, action, time],
    };
    const newActivity = db.one(query);
    return newActivity;
  } catch (err) {
    console.error('Error inserting playlist activity');
  }
};

const getPlaylistActivities = async (playlistId) => {
  const query = {
    text: `SELECT 
              la.id,
              p.name AS playlist_name, 
              u.username, 
              s.title, 
              la.action, 
              la.time 
          FROM 
              "LogActivity" la
          JOIN 
              "Users" u ON la.user_id = u.id
          JOIN 
              "Songs" s ON la.song_id = s.id
          JOIN 
              "Playlists" p ON la.playlist_id = p.id
          WHERE 
              la.playlist_id = $1
          ORDER BY 
              la.time DESC;
        `,
    values: [playlistId],
  };

  const activities = await db.any(query);
  return activities;
};

module.exports = {
  addPlaylistActivities,
  getPlaylistActivities,
};

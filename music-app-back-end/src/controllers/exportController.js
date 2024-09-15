/* eslint-disable linebreak-style */

const { sendToQueue } = require('../config/rabbitMQ');

const exportPlaylist = async (playlistId, userId, targetEmail) => {
  const exportData = {
    playlistId,
    userId,
    targetEmail,
    requestTime: new Date().toISOString(),
  };

  try {
    await sendToQueue('export:playlist', exportData);
    return { status: 'success', message: 'Export request has been queued' };
  } catch (err) {
    throw new Error('Failed to queue export request');
  }
};

module.exports = { exportPlaylist };

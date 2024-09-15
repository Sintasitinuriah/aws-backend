/* eslint-disable linebreak-style */
/* eslint-disable no-trailing-spaces */
/* eslint-disable linebreak-style */
exports.shorthands = undefined;

exports.up = (pgm) => {
  pgm.dropTable('Playlists_songs', { ifExists: true });

  pgm.createTable('Playlists_songs', {
    id: {
      type: 'varchar(20)', 
      primaryKey: true,
    },
    playlist_id: {
      type: 'varchar(20)',
      references: 'Playlists',
      onDelete: 'CASCADE',
    },
    song_id: {
      type: 'varchar(20)',
      references: 'Songs',
      onDelete: 'CASCADE',
    },
    createdAt: { type: 'timestamp', default: pgm.func('current_timestamp') },
    updatedAt: { type: 'timestamp', default: pgm.func('current_timestamp') },
  });
};

exports.down = (pgm) => {
  pgm.dropTable('Playlists_songs');
};

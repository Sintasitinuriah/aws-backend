/* eslint-disable linebreak-style */
/* eslint-disable no-trailing-spaces */
/* eslint-disable linebreak-style */
exports.shorthands = true;

exports.up = (pgm) => {
  pgm.dropTable('LogActivity', { ifExists: true });

  pgm.createTable('LogActivity', {
    id: {
      type: 'varchar(20)', 
      primaryKey: true,
    },
    playlist_id: {
      type: 'varchar(20)',
      notNull: true,
    },
    user_id: {
      type: 'varchar(20)',
      notNull: true,
    },
    song_id: {
      type: 'varchar(20)',
      notNull: true,
    },
    action: { type: 'varchar(255)', notNull: true },
    time: { type: 'timestamp', notNull: true, default: pgm.func('current_timestamp') },
  });

  pgm.addConstraint('LogActivity', 'fk_logactivity.playlist_id_Playlists.id', 'FOREIGN KEY(playlist_id) REFERENCES "Playlists"(id) ON DELETE CASCADE');
};

exports.down = (pgm) => {
  pgm.dropTable('LogActivity');
};

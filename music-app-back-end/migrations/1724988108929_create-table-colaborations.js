/* eslint-disable camelcase */

exports.shorthands = undefined;

exports.up = (pgm) => {
  // membuat table collaborations
  pgm.createTable('Collaborations', {
    id: {
      type: 'VARCHAR(50)',
      primaryKey: true,
    },
    playlist_id: {
      type: 'VARCHAR(50)',
      notNull: true,
    },
    user_id: {
      type: 'VARCHAR(50)',
      notNull: true,
    },
  });

  pgm.addConstraint('Collaborations', 'unique_playlist_id_and_user_id', 'UNIQUE(playlist_id, user_id)');

  pgm.addConstraint('Collaborations', 'fk_collaborations.playlist_id_Playlists.id', 'FOREIGN KEY(playlist_id) REFERENCES "Playlists"(id) ON DELETE CASCADE');
  pgm.addConstraint('Collaborations', 'fk_collaborations.user_id_users.id', 'FOREIGN KEY(user_id) REFERENCES users(id) ON DELETE CASCADE');
};

exports.down = (pgm) => {
  pgm.dropTable('Collaborations');
};

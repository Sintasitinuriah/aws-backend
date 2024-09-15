/* eslint-disable linebreak-style */
/* eslint-disable no-trailing-spaces */
/* eslint-disable linebreak-style */
exports.shorthands = undefined;

exports.up = (pgm) => {
  pgm.dropTable('Playlists', { ifExists: true });

  pgm.createTable('Playlists', {
    id: {
      type: 'varchar(20)', 
      primaryKey: true,
    },
    name: { type: 'varchar(255)', notNull: true },
    owner: {
      type: 'varchar(20)',
      references: 'users',
      onDelete: 'CASCADE',
    },
    createdAt: { type: 'timestamp', default: pgm.func('current_timestamp') },
    updatedAt: { type: 'timestamp', default: pgm.func('current_timestamp') },
  });
};

exports.down = (pgm) => {
  pgm.dropTable('Playlists');
};

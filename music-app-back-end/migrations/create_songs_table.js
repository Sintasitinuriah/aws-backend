/* eslint-disable linebreak-style */
/* eslint-disable no-trailing-spaces */
/* eslint-disable linebreak-style */
exports.shorthands = true;

exports.up = (pgm) => {
  pgm.dropTable('Songs', { ifExists: true });

  pgm.createTable('Songs', {
    id: {
      type: 'varchar(20)', 
      primaryKey: true,
    },
    title: { type: 'varchar(255)', notNull: true },
    year: { type: 'int', notNull: true },
    genre: { type: 'varchar(50)', notNull: true },
    performer: { type: 'varchar(255)', notNull: true },
    duration: { type: 'int' },
    albumId: {
      type: 'varchar(20)',
      references: 'Albums',
      onDelete: 'CASCADE',
    },
    createdAt: { type: 'timestamp', default: pgm.func('current_timestamp') },
    updatedAt: { type: 'timestamp', default: pgm.func('current_timestamp') },
  });
};

exports.down = (pgm) => {
  pgm.dropTable('Songs');
};

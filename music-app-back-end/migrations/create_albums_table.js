/* eslint-disable linebreak-style */
/* eslint-disable no-trailing-spaces */
exports.up = (pgm) => {
  pgm.createTable('Albums', {
    id: {
      type: 'varchar(20)',
      primaryKey: true,
    },
    name: { type: 'varchar(255)', notNull: true },
    year: { type: 'integer', notNull: true },
  });
};
  
exports.down = (pgm) => {
  pgm.dropTable('Albums');
};

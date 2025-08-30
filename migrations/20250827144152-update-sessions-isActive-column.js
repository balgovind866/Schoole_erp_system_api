'use strict';

module.exports = {
  up: async (queryInterface, Sequelize) => {
    // First remove the old column if it exists
    await queryInterface.removeColumn('Sessions', 'isactive');

    // Then add the new column with default value
    await queryInterface.addColumn('Sessions', 'isActive', {
      type: Sequelize.BOOLEAN,
      defaultValue: false,
      allowNull: false
    });
  },

  down: async (queryInterface, Sequelize) => {
    // Rollback: remove new column and add back old one
    await queryInterface.removeColumn('Sessions', 'isActive');
    await queryInterface.addColumn('Sessions', 'isactive', {
      type: Sequelize.BOOLEAN,
      allowNull: true
    });
  }
};

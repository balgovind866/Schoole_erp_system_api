'use strict';

module.exports = {
  up: async (queryInterface, Sequelize) => {
    await queryInterface.addColumn('SchoolAlls', 'schoolId', {
      type: Sequelize.INTEGER,
      allowNull: true // Set false if you want it required
    });
  },

  down: async (queryInterface, Sequelize) => {
    await queryInterface.removeColumn('SchoolAlls', 'schoolId');
  }
};

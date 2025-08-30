'use strict';

module.exports = {
  up: async (queryInterface, Sequelize) => {
    await queryInterface.renameTable('SchoolAlls', 'schools');
  },
  down: async (queryInterface, Sequelize) => {
    await queryInterface.renameTable('schools', 'SchoolAlls');
  }
};
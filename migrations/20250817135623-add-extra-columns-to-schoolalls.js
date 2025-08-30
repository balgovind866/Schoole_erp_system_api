'use strict';

module.exports = {
  up: async (queryInterface, Sequelize) => {
    await queryInterface.addColumn('SchoolAlls', 'address', {
      type: Sequelize.TEXT,
      allowNull: true
    });
    await queryInterface.addColumn('SchoolAlls', 'phone', {
      type: Sequelize.STRING,
      allowNull: true
    });
    await queryInterface.addColumn('SchoolAlls', 'email', {
      type: Sequelize.STRING,
      allowNull: true
    });
    await queryInterface.addColumn('SchoolAlls', 'principalName', {
      type: Sequelize.STRING,
      allowNull: true
    });
    await queryInterface.addColumn('SchoolAlls', 'establishedYear', {
      type: Sequelize.INTEGER,
      allowNull: true
    });
    await queryInterface.addColumn('SchoolAlls', 'isActive', {
      type: Sequelize.BOOLEAN,
      defaultValue: true
    });
  },

  down: async (queryInterface, Sequelize) => {
    await queryInterface.removeColumn('SchoolAlls', 'address');
    await queryInterface.removeColumn('SchoolAlls', 'phone');
    await queryInterface.removeColumn('SchoolAlls', 'email');
    await queryInterface.removeColumn('SchoolAlls', 'principalName');
    await queryInterface.removeColumn('SchoolAlls', 'establishedYear');
    await queryInterface.removeColumn('SchoolAlls', 'isActive');
  }
};

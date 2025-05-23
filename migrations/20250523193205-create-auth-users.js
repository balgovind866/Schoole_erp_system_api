'use strict';

module.exports = {
  up: async (queryInterface, Sequelize) => {
    await queryInterface.createTable('auth_users', {
      id: {
        type: Sequelize.INTEGER,
        primaryKey: true,
        autoIncrement: true,
        allowNull: false
      },
      username: {
        type: Sequelize.STRING,
        allowNull: false,
        unique: true
      },
      email: {
        type: Sequelize.STRING,
        allowNull: true,
        unique: true
      },
      password: {
        type: Sequelize.STRING,
        allowNull: false
      },
      fullName: {
        type: Sequelize.STRING,
        allowNull: true
      },
      userCode: {
        type: Sequelize.STRING,
        allowNull: true
      },
      address: {
        type: Sequelize.STRING,
        allowNull: true
      },
      joinDate: {
        type: Sequelize.DATE,
        allowNull: true
      },
      dob: {
        type: Sequelize.DATE,
        allowNull: true
      },
      mobileNumber: {
        type: Sequelize.STRING,
        allowNull: true
      },
      gender: {
        type: Sequelize.STRING,
        allowNull: true
      },
      maritalStatus: {
        type: Sequelize.STRING,
        allowNull: true
      },
      qualification: {
        type: Sequelize.STRING,
        allowNull: true
      },
      imgPath: {
        type: Sequelize.STRING,
        allowNull: true
      },
      aadhar: {
        type: Sequelize.STRING,
        allowNull: true
      },
      classInCharge: {
        type: Sequelize.STRING,
        allowNull: true
      },
      sectionId: {
        type: Sequelize.INTEGER,
        allowNull: true
      },
      appQrAutoAccept: {
        type: Sequelize.BOOLEAN,
        defaultValue: false
      },
      schoolId: {
        type: Sequelize.INTEGER,
        allowNull: true
      },
      role: {
        type: Sequelize.ENUM('admin', 'teacher', 'student'),
        defaultValue: 'student'
      },
      isActive: {
        type: Sequelize.BOOLEAN,
        defaultValue: true
      },
      lastLogin: {
        type: Sequelize.DATE,
        allowNull: true
      },
      createdAt: {
        allowNull: false,
        type: Sequelize.DATE,
        defaultValue: Sequelize.literal('CURRENT_TIMESTAMP')
      },
      updatedAt: {
        allowNull: false,
        type: Sequelize.DATE,
        defaultValue: Sequelize.literal('CURRENT_TIMESTAMP')
      }
    });
  },

  down: async (queryInterface, Sequelize) => {
    await queryInterface.dropTable('auth_users');
  }
};
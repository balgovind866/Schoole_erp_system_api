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
        allowNull: false
      },
      userCode: {
        type: Sequelize.STRING,
        allowNull: true,
        unique: true
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
        type: Sequelize.ENUM('male', 'female', 'other'),
        allowNull: true
      },
      address: {
        type: Sequelize.TEXT,
        allowNull: true
      },
      profileImage: {
        type: Sequelize.STRING,
        allowNull: true
      },
      schoolId: {
        type: Sequelize.INTEGER,
        allowNull: false,
        references: {
          model: 'SchoolAlls', // 👈 must match your school table
          key: 'id'
        },
        onUpdate: 'CASCADE',
        onDelete: 'CASCADE'
      },
      role: {
        type: Sequelize.ENUM('admin', 'superadmin', 'teacher', 'student', 'principal', 'staff'),
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
      emergencyContact: {
        type: Sequelize.STRING,
        allowNull: true
      },
      parentName: {
        type: Sequelize.STRING,
        allowNull: true
      },
      parentPhone: {
        type: Sequelize.STRING,
        allowNull: true
      },
      joinDate: {
        type: Sequelize.DATE,
        allowNull: true
      },
      qualification: {
        type: Sequelize.STRING,
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
    await queryInterface.sequelize.query('DROP TYPE IF EXISTS "enum_auth_users_role";');
    await queryInterface.sequelize.query('DROP TYPE IF EXISTS "enum_auth_users_gender";');
  }
};

'use strict';

module.exports = {
  up: async (queryInterface, Sequelize) => {
    await queryInterface.createTable('notices', {
      id: {
        type: Sequelize.INTEGER,
        primaryKey: true,
        autoIncrement: true,
        allowNull: false
      },
      title: {
        type: Sequelize.STRING,
        allowNull: false
      },
      content: {
        type: Sequelize.TEXT,
        allowNull: false
      },
      noticeType: {
        type: Sequelize.ENUM(
          'general',
          'urgent',
          'event',
          'exam',
          'holiday',
          'academic',
          'administrative',
          'circular'
        ),
        defaultValue: 'general'
      },
      priority: {
        type: Sequelize.ENUM('low', 'medium', 'high', 'urgent'),
        defaultValue: 'medium'
      },
      targetAudience: {
        type: Sequelize.ENUM(
          'all',
          'students',
          'teachers',
          'parents',
          'staff',
          'admin',
          'specific_class',
          'specific_section'
        ),
        defaultValue: 'all'
      },
      targetClassId: {
        type: Sequelize.INTEGER,
        allowNull: true
      },
      targetSectionId: {
        type: Sequelize.INTEGER,
        allowNull: true
      },
      schoolId: {
        type: Sequelize.INTEGER,
        allowNull: false,
        references: {
          model: 'SchoolAlls',
          key: 'id'
        },
        onDelete: 'CASCADE'
      },
      sessionId: {
        type: Sequelize.INTEGER,
        allowNull: true
      },
      authorId: {
        type: Sequelize.INTEGER,
        allowNull: false,
        references: {
          model: 'auth_users',
          key: 'id'
        },
        onDelete: 'SET NULL'
      },
      attachmentPath: {
        type: Sequelize.STRING,
        allowNull: true
      },
      attachmentName: {
        type: Sequelize.STRING,
        allowNull: true
      },
      publishDate: {
        type: Sequelize.DATE,
        allowNull: true,
        defaultValue: Sequelize.NOW
      },
      expiryDate: {
        type: Sequelize.DATE,
        allowNull: true
      },
      isPublished: {
        type: Sequelize.BOOLEAN,
        defaultValue: true
      },
      isActive: {
        type: Sequelize.BOOLEAN,
        defaultValue: true
      },
      totalViews: {
        type: Sequelize.INTEGER,
        defaultValue: 0
      },
      isPinned: {
        type: Sequelize.BOOLEAN,
        defaultValue: false
      },
      pinOrder: {
        type: Sequelize.INTEGER,
        allowNull: true
      },
      approvalStatus: {
        type: Sequelize.ENUM('draft', 'pending', 'approved', 'rejected'),
        defaultValue: 'approved'
      },
      approvedBy: {
        type: Sequelize.INTEGER,
        allowNull: true,
        references: {
          model: 'auth_users',
          key: 'id'
        },
        onDelete: 'SET NULL'
      },
      approvedAt: {
        type: Sequelize.DATE,
        allowNull: true
      },
      tags: {
        type: Sequelize.STRING,
        allowNull: true
      },
      noticeNumber: {
        type: Sequelize.STRING,
        allowNull: true,
        unique: true
      },
      createdAt: {
        type: Sequelize.DATE,
        allowNull: false,
        defaultValue: Sequelize.literal('CURRENT_TIMESTAMP')
      },
      updatedAt: {
        type: Sequelize.DATE,
        allowNull: false,
        defaultValue: Sequelize.literal('CURRENT_TIMESTAMP')
      }
    });

    // Add indexes
    await queryInterface.addIndex('notices', ['schoolId', 'isPublished', 'isActive']);
    await queryInterface.addIndex('notices', ['targetAudience']);
    await queryInterface.addIndex('notices', ['noticeType']);
    await queryInterface.addIndex('notices', ['publishDate']);
    await queryInterface.addIndex('notices', ['isPinned', 'pinOrder']);
    await queryInterface.addIndex('notices', ['expiryDate']);
  },

  down: async (queryInterface, Sequelize) => {
    await queryInterface.dropTable('notices');
  }
};

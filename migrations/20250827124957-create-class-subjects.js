'use strict';

module.exports = {
  async up(queryInterface, Sequelize) {
    await queryInterface.createTable('ClassSubjects', {
      id: {
        type: Sequelize.INTEGER,
        autoIncrement: true,
        primaryKey: true
      },
      classId: {
        type: Sequelize.INTEGER,
        allowNull: false,
        references: {
          model: 'classes', // table name
          key: 'id'
        },
        onDelete: 'CASCADE'
      },
      subjectId: {
        type: Sequelize.INTEGER,
        allowNull: false,
        references: {
          model: 'subjects', // table name
          key: 'id'
        },
        onDelete: 'CASCADE'
      },
      isActive: {
        type: Sequelize.BOOLEAN,
        defaultValue: true
      },
      createdAt: {
        type: Sequelize.DATE,
        defaultValue: Sequelize.literal('CURRENT_TIMESTAMP')
      },
      updatedAt: {
        type: Sequelize.DATE,
        defaultValue: Sequelize.literal('CURRENT_TIMESTAMP'),
        onUpdate: Sequelize.literal('CURRENT_TIMESTAMP')
      }
    });

    // Add unique and indexes
    await queryInterface.addConstraint('ClassSubjects', {
      fields: ['classId', 'subjectId'],
      type: 'unique',
      name: 'unique_class_subject'
    });

    await queryInterface.addIndex('ClassSubjects', ['classId'], {
      name: 'idx_class_subjects_class'
    });
    await queryInterface.addIndex('ClassSubjects', ['subjectId'], {
      name: 'idx_class_subjects_subject'
    });
    await queryInterface.addIndex('ClassSubjects', ['isActive'], {
      name: 'idx_class_subjects_active'
    });
  },

  async down(queryInterface, Sequelize) {
    await queryInterface.dropTable('ClassSubjects');
  }
};

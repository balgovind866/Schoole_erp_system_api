'use strict';

module.exports = {
  async up(queryInterface, Sequelize) {
    await queryInterface.createTable('class_fees', {
      id: {
        type: Sequelize.INTEGER,
        primaryKey: true,
        autoIncrement: true,
        allowNull: false
      },
      feeStructureId: {
        type: Sequelize.INTEGER,
        allowNull: false,
        references: {
          model: 'fee_structures', // 👈 reference FeeStructure table
          key: 'id'
        },
        onUpdate: 'CASCADE',
        onDelete: 'CASCADE'
      },
      feeCategoryId: {
        type: Sequelize.INTEGER,
        allowNull: false,
        references: {
          model: 'fee_categories', // 👈 reference FeeCategory table
          key: 'id'
        },
        onUpdate: 'CASCADE',
        onDelete: 'CASCADE'
      },
      classId: {
        type: Sequelize.INTEGER,
        allowNull: false,
        references: {
          model: 'classes', // 👈 reference Classes table
          key: 'id'
        },
        onUpdate: 'CASCADE',
        onDelete: 'CASCADE'
      },
      amount: {
        type: Sequelize.DECIMAL(10, 2),
        allowNull: false
      },
      isActive: {
        type: Sequelize.BOOLEAN,
        defaultValue: true
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

    // Add unique composite index
    await queryInterface.addConstraint('class_fees', {
      fields: ['feeStructureId', 'feeCategoryId', 'classId'],
      type: 'unique',
      name: 'unique_class_fee'
    });
  },

  async down(queryInterface, Sequelize) {
    await queryInterface.dropTable('class_fees');
  }
};

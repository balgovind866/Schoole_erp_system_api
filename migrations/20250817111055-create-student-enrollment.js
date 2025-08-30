'use strict';

module.exports = {
  async up(queryInterface, Sequelize) {
    await queryInterface.createTable('student_enrollments', {
      id: {
        type: Sequelize.INTEGER,
        primaryKey: true,
        autoIncrement: true,
        allowNull: false
      },
      studentId: {
        type: Sequelize.INTEGER,
        allowNull: false
      },
      sessionId: {
        type: Sequelize.INTEGER,
        allowNull: false
      },
      classId: {
        type: Sequelize.INTEGER,
        allowNull: false
      },
      sectionId: {
        type: Sequelize.INTEGER,
        allowNull: false
      },
      rollNumber: {
        type: Sequelize.STRING,
        allowNull: true
      },
      admissionNumber: {
        type: Sequelize.STRING,
        allowNull: true
      },
      enrollmentDate: {
        type: Sequelize.DATE,
        defaultValue: Sequelize.NOW
      },
      isActive: {
        type: Sequelize.BOOLEAN,
        defaultValue: true
      },
      status: {
        type: Sequelize.ENUM('active', 'transferred', 'passed', 'failed', 'dropout'),
        defaultValue: 'active'
      },
      createdAt: {
        type: Sequelize.DATE,
        allowNull: false,
        defaultValue: Sequelize.NOW
      },
      updatedAt: {
        type: Sequelize.DATE,
        allowNull: false,
        defaultValue: Sequelize.NOW
      }
    });

    // Unique constraint: studentId + sessionId
    await queryInterface.addConstraint('student_enrollments', {
      fields: ['studentId', 'sessionId'],
      type: 'unique',
      name: 'unique_student_session'
    });

    // Unique constraint: sessionId + sectionId + rollNumber (if rollNumber is not null)
    await queryInterface.addConstraint('student_enrollments', {
      fields: ['sessionId', 'sectionId', 'rollNumber'],
      type: 'unique',
      name: 'unique_roll_per_section_session',
      where: {
        rollNumber: { [Sequelize.Op.not]: null }
      }
    });
  },

  async down(queryInterface, Sequelize) {
    await queryInterface.dropTable('student_enrollments');
  }
};

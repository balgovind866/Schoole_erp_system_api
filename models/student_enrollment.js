// models/studentenrollment.js
module.exports = (sequelize, DataTypes) => {
  const StudentEnrollment = sequelize.define("StudentEnrollment", {
    id: {
      type: DataTypes.INTEGER,
      primaryKey: true,
      autoIncrement: true
    },
    studentId: {
      type: DataTypes.INTEGER,
      allowNull: false
    },
    sessionId: {
      type: DataTypes.INTEGER,
      allowNull: false
    },
    classId: {
      type: DataTypes.INTEGER,
      allowNull: false
    },
    sectionId: {
      type: DataTypes.INTEGER,
      allowNull: false
    },
    rollNumber: {
      type: DataTypes.STRING,
      allowNull: true
    },
    admissionNumber: {
      type: DataTypes.STRING,
      allowNull: true
    },
    enrollmentDate: {
      type: DataTypes.DATE,
      defaultValue: DataTypes.NOW
    },
    isActive: {
      type: DataTypes.BOOLEAN,
      defaultValue: true
    },
    status: {
      type: DataTypes.ENUM('active', 'transferred', 'passed', 'failed', 'dropout'),
      defaultValue: 'active'
    }
  }, {
    tableName: 'student_enrollments',
    timestamps: true,
    indexes: [
      {
        unique: true,
        fields: ['studentId', 'sessionId']
      },
      {
        unique: true,
        fields: ['sessionId', 'sectionId', 'rollNumber'],
        where: {
          rollNumber: {
            [sequelize.Sequelize.Op.not]: null
          }
        }
      }
    ]
  });

  // Associations
  StudentEnrollment.associate = (models) => {
    StudentEnrollment.belongsTo(models.AuthUser, {
      foreignKey: 'studentId',
      as: 'student'
    });

    StudentEnrollment.belongsTo(models.Session, {
      foreignKey: 'sessionId',
      as: 'session'
    });

    StudentEnrollment.belongsTo(models.Class, {
      foreignKey: 'classId',
      as: 'class'
    });

    StudentEnrollment.belongsTo(models.Section, {
      foreignKey: 'sectionId',
      as: 'section'
    });
  };

  return StudentEnrollment;
};

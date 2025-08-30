module.exports = (sequelize, DataTypes) => {
  const Subject = sequelize.define("Subject", {
    id: {
      type: DataTypes.INTEGER,
      primaryKey: true,
      autoIncrement: true
    },
    schoolCode: {
      type: DataTypes.STRING,
      allowNull: false
    },
    name: {
      type: DataTypes.STRING,
      allowNull: false
    },
    code: {
      type: DataTypes.STRING,
      allowNull: true // e.g., "MATH", "ENG", "SCI"
    },
    description: {
      type: DataTypes.TEXT,
      allowNull: true
    },
    isActive: {
      type: DataTypes.BOOLEAN,
      defaultValue: true
    }
  }, {
    tableName: 'subjects',
    timestamps: true
  });

  Subject.associate = (models) => {
    // Belongs to School
    Subject.belongsTo(models.SchoolAll, {
      foreignKey: 'schoolCode',
      targetKey: 'code',
      as: 'school'
    });

    // Belongs to many classes
    Subject.belongsToMany(models.Class, {
      through: 'ClassSubjects',
      foreignKey: 'subjectId',
      as: 'classes'
    });

    // Has many section teachers
    Subject.hasMany(models.SectionSubjectTeacher, {
      foreignKey: 'subjectId',
      as: 'sectionTeachers'
    });
  };

  return Subject;
};

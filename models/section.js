module.exports = (sequelize, DataTypes) => {
  const Section = sequelize.define("Section", {
    id: {
      type: DataTypes.INTEGER,
      primaryKey: true,
      autoIncrement: true
    },
    schoolCode: {
      type: DataTypes.STRING,
      allowNull: false
    },
    classId: {
      type: DataTypes.INTEGER,
      allowNull: false
    },
    name: {
      type: DataTypes.STRING,
      allowNull: false // e.g., "A", "B", "C"
    },
    capacity: {
      type: DataTypes.INTEGER,
      defaultValue: 30
    },
    classTeacherId: {
      type: DataTypes.INTEGER,
      allowNull: true
    },
    room: {
      type: DataTypes.STRING,
      allowNull: true
    },
    isActive: {
      type: DataTypes.BOOLEAN,
      defaultValue: true
    }
  }, {
    tableName: 'sections',
    timestamps: true
  });

  Section.associate = (models) => {
    // Belongs to School
    Section.belongsTo(models.SchoolAll, {
      foreignKey: 'schoolCode',
      targetKey: 'code',
      as: 'school'
    });

    // // Belongs to Class
    Section.belongsTo(models.Class, {
      foreignKey: 'classId',
      as: 'class'
    });

  //  Has one class teacher
    Section.belongsTo(models.AuthUser, {
      foreignKey: 'classTeacherId',
      as: 'classTeacher'
    });

    // Has many students
    // Section.hasMany(models.StudentEnrollment, {
    //   foreignKey: 'sectionId',
    //   as: 'students'
    // });

    // Has many subject teachers
    Section.hasMany(models.SectionSubjectTeacher, {
      foreignKey: 'sectionId',
      as: 'subjectTeachers'
    });
  };

  return Section;
};

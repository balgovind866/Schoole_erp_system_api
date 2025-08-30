module.exports = (sequelize, DataTypes) => {
  const SectionSubjectTeacher = sequelize.define("SectionSubjectTeacher", {
    id: {
      type: DataTypes.INTEGER,
      primaryKey: true,
      autoIncrement: true
    },
    sectionId: {
      type: DataTypes.INTEGER,
      allowNull: false
    },
    subjectId: {
      type: DataTypes.INTEGER,
      allowNull: false
    },
    teacherId: {
      type: DataTypes.INTEGER,
      allowNull: false
    },
    isActive: {
      type: DataTypes.BOOLEAN,
      defaultValue: true
    }
  }, {
    tableName: 'section_subject_teachers',
    timestamps: true
  });

  SectionSubjectTeacher.associate = (models) => {
    // Belongs to Section
    SectionSubjectTeacher.belongsTo(models.Section, {
      foreignKey: 'sectionId',
      as: 'section'
    });

    
    // Belongs to Subject
    SectionSubjectTeacher.belongsTo(models.Subject, {
      foreignKey: 'subjectId',
      as: 'subject'
    });

    // Belongs to Teacher
    SectionSubjectTeacher.belongsTo(models.AuthUser, {
      foreignKey: 'teacherId',
      as: 'teacher'
    });
  };

  return SectionSubjectTeacher;
};
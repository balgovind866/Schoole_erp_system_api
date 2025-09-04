module.exports = (sequelize, DataTypes) => {
  const Class = sequelize.define(
    "Class",
    {
      id: {
        type: DataTypes.INTEGER,
        primaryKey: true,
        autoIncrement: true,
      },
      schoolCode: {
        type: DataTypes.STRING,
        allowNull: false,
      },
      name: {
        type: DataTypes.STRING,
        allowNull: false, // e.g., "Class 1", "Class 2", "Nursery", "KG"
      },
      level: {
        type: DataTypes.INTEGER,
        allowNull: true, // 1, 2, 3... for sorting
      },
      description: {
        type: DataTypes.TEXT,
        allowNull: true,
      },
      isActive: {
        type: DataTypes.BOOLEAN,
        defaultValue: true,
      },
    },
    {
      tableName: "classes",
      timestamps: true,
    }
  );

  Class.associate = (models) => {
    // Belongs to School
    Class.belongsTo(models.SchoolAll, {
      foreignKey: "schoolCode",
      targetKey: "code",
      as: "school",
    });

    // Has many sections
    Class.hasMany(models.Section, {
      foreignKey: "classId",
      as: "sections",
    });

    // // Has many subjects
    Class.belongsToMany(models.Subject, {
      through: "ClassSubjects",
      foreignKey: "classId",
      as: "subjects",
    });

    // Has many enrollments
    Class.hasMany(models.StudentEnrollment, {
      foreignKey: "classId",
      as: "enrollments",
    });
  };

  return Class;
};

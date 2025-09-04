module.exports = (sequelize, DataTypes) => {
  const SchoolAll = sequelize.define(
    "SchoolAll",
    {
      id: {
        type: DataTypes.INTEGER,
        primaryKey: true,
        autoIncrement: true,
      },
      code: {
        type: DataTypes.STRING,
        unique: true,
        allowNull: false,
      },
      name: {
        type: DataTypes.STRING,
        allowNull: false,
      },
      address: {
        type: DataTypes.TEXT,
        allowNull: true,
      },
      phone: {
        type: DataTypes.STRING,
        allowNull: true,
      },
      email: {
        type: DataTypes.STRING,
        allowNull: true,
        validate: {
          isEmail: true,
        },
      },
      baseUrl: {
        type: DataTypes.STRING,
        allowNull: false,
      },
      logoPath: {
        type: DataTypes.STRING,
      },
      bannerPath: {
        type: DataTypes.STRING,
      },
      paymentLink: {
        type: DataTypes.STRING,
      },
      principalName: {
        type: DataTypes.STRING,
        allowNull: true,
      },
      establishedYear: {
        type: DataTypes.INTEGER,
        allowNull: true,
      },
      isActive: {
        type: DataTypes.BOOLEAN,
        defaultValue: true,
      },
    },
    {
      tableName: "schools", // custom table name
      timestamps: true, // adds createdAt and updatedAt
    }
  );

  SchoolAll.associate = (models) => {
    // Each school can have many sessions
    SchoolAll.hasMany(models.Session, {
      foreignKey: "schoolCode",
      sourceKey: "code",
      as: "sessions",
    });

    // Each school can have many classes
    SchoolAll.hasMany(models.Class, {
      foreignKey: "schoolCode",
      sourceKey: "code",
      as: "classes",
    });

    // Each school can have many sections
    SchoolAll.hasMany(models.Section, {
      foreignKey: "schoolCode",
      sourceKey: "code",
      as: "sections",
    });

    // Each school can have many users
    SchoolAll.hasMany(models.AuthUser, {
      foreignKey: "schoolId",
      as: "users",
    });

    // Each school can have many subjects
    SchoolAll.hasMany(models.Subject, {
      foreignKey: "schoolCode",
      sourceKey: "code",
      as: "subjects",
    });
  };

  return SchoolAll;
};

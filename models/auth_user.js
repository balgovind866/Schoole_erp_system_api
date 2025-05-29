module.exports = (sequelize, DataTypes) => {
  const AuthUser = sequelize.define('AuthUser', {
    id: {
      type: DataTypes.INTEGER,
      primaryKey: true,
      autoIncrement: true
    },
    username: {
      type: DataTypes.STRING,
      allowNull: false,
      unique: true
    },
    email: {
      type: DataTypes.STRING,
      allowNull: true,
      unique: true,
      validate: {
        isEmail: true
      }
    },
    password: {
      type: DataTypes.STRING,
      allowNull: false
    },
    // Maps to empname in Flutter
    fullName: {
      type: DataTypes.STRING,
      allowNull: true
    },
    // Maps to empcode in Flutter
    userCode: {
      type: DataTypes.STRING,
      allowNull: true
    },
    address: {
      type: DataTypes.STRING,
      allowNull: true
    },
    joinDate: {
      type: DataTypes.DATE,
      allowNull: true
    },
    dob: {
      type: DataTypes.DATE,
      allowNull: true
    },
    mobileNumber: {
      type: DataTypes.STRING,
      allowNull: true
    },
    gender: {
      type: DataTypes.STRING,
      allowNull: true
    },
    maritalStatus: {
      type: DataTypes.STRING,
      allowNull: true
    },
    qualification: {
      type: DataTypes.STRING,
      allowNull: true
    },
    imgPath: {
      type: DataTypes.STRING,
      allowNull: true
    },
    aadhar: {
      type: DataTypes.STRING,
      allowNull: true
    },
    classInCharge: {
      type: DataTypes.STRING,
      allowNull: true
    },
    sectionId: {
      type: DataTypes.INTEGER,
      allowNull: true
    },
    appQrAutoAccept: {
      type: DataTypes.BOOLEAN,
      defaultValue: false
    },
    schoolId: {
      type: DataTypes.INTEGER,
      allowNull: true
    },
    role: {
      type: DataTypes.ENUM('admin', 'teacher', 'student'),
      defaultValue: 'student'
    },
    isActive: {
      type: DataTypes.BOOLEAN,
      defaultValue: true
    },
    lastLogin: {
      type: DataTypes.DATE,
      allowNull: true
    }
  }, {
    tableName: 'auth_users',
    timestamps: true
  });

  // Define associations
  AuthUser.associate = (models) => {
    // Association with school
    if (models.SchoolAll) {
      AuthUser.belongsTo(models.SchoolAll, {
        foreignKey: 'schoolId',
        as: 'school'
      });
    }
    
    // Association with section if needed
    if (models.Section) {
      AuthUser.belongsTo(models.Section, {
        foreignKey: 'sectionId',
        as: 'section'
      });
    }
  };

  return AuthUser;
};

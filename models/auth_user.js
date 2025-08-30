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
    fullName: {
      type: DataTypes.STRING,
      allowNull: false
    },
    userCode: {
      type: DataTypes.STRING,
      allowNull: true,
      unique: true // For employee/student ID
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
      type: DataTypes.ENUM('male', 'female', 'other'),
      allowNull: true
    },
    address: {
      type: DataTypes.TEXT,
      allowNull: true
    },
    
    schoolId: {
      type: DataTypes.INTEGER,
      allowNull: false,
      references: {
        model: 'schools',
        key: 'id'
      }
    },
    role: {
      type: DataTypes.ENUM('admin', 'teacher', 'student', 'principal', 'staff'),
      defaultValue: 'student'
    },
    isActive: {
      type: DataTypes.BOOLEAN,
      defaultValue: true
    },
    lastLogin: {
      type: DataTypes.DATE,
      allowNull: true
    },
   
    // For staff only
    joinDate: {
      type: DataTypes.DATE,
      allowNull: true
    },
    qualification: {
      type: DataTypes.STRING,
      allowNull: true
    }
  }, {
    tableName: 'auth_users',
    timestamps: true
  });

  AuthUser.associate = (models) => {
    // Association with school
    AuthUser.belongsTo(models.SchoolAll, {
      foreignKey: 'schoolId',
      as: 'school'
    });

    // Student enrollments (one user can have multiple enrollments across sessions)
    AuthUser.hasMany(models.StudentEnrollment, {
      foreignKey: 'studentId',
      as: 'enrollments'
    });

    // Class teacher sections
    AuthUser.hasMany(models.Section, {
      foreignKey: 'classTeacherId',
      as: 'classSections'
    });

    // Subject teaching assignments
    AuthUser.hasMany(models.SectionSubjectTeacher, {
      foreignKey: 'teacherId',
      as: 'subjectAssignments'
    });
  };

  return AuthUser;
};
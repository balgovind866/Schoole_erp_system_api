"use strict";
module.exports = (sequelize, DataTypes) => {
  const StudentDocuments = sequelize.define(
    "StudentDocuments",
    {
      id: {
        allowNull: false,
        autoIncrement: true,
        primaryKey: true,
        type: DataTypes.INTEGER,
      },
      studentId: {
        type: DataTypes.INTEGER,
      },
      documentName: {
        type: DataTypes.STRING,
      },
      filePath: {
        type: DataTypes.STRING,
      },
      status: {
        type: DataTypes.STRING,
      },
      uploadDate: {
        type: DataTypes.DATE,
      },
    },
    {
      tableName: "student_documents",
      timestamps: true,
    }
  );

  StudentDocuments.associate = (models) => {
    StudentDocuments.belongsTo(models.AuthUser, {
      foreignKey: "studentId",
      as: "student",
    });
  };

  return StudentDocuments;
};

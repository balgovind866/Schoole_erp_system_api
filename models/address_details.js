"use strict";
module.exports = (sequelize, DataTypes) => {
  const Parent = sequelize.define(
    "Parent",
    {
      id: {
        allowNull: false,
        autoIncrement: true,
        primaryKey: true,
        type: DataTypes.INTEGER,
      },
      firstName: {
        type: DataTypes.STRING,
      },
      middleName: {
        type: DataTypes.STRING,
      },
      lastName: {
        type: DataTypes.STRING,
      },
      relationship: {
        type: DataTypes.STRING,
      },
      email: {
        type: DataTypes.STRING,
      },
      phoneNumber: {
        type: DataTypes.STRING,
      },
      studentId: {
        type: DataTypes.INTEGER,
      },
    },
    {
      tableName: "parents",
      timestamps: true,
    }
  );

  Parent.associate = (models) => {
    Parent.belongsTo(models.AuthUser, {
      foreignKey: "studentId",
      as: "student",
    });
  };

  return Parent;
};

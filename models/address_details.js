"use strict";

module.exports = (sequelize, DataTypes) => {
  const AddressDetail = sequelize.define(
    "AddressDetail",
    {
      id: {
        allowNull: false,
        autoIncrement: true,
        primaryKey: true,
        type: DataTypes.INTEGER,
      },
      address1: {
        type: DataTypes.STRING,
      },
      address2: {
        type: DataTypes.STRING,
      },
      city: {
        type: DataTypes.STRING,
      },
      state: {
        type: DataTypes.STRING,
      },
      zipCode: {
        type: DataTypes.STRING, // string to allow leading zeros
      },
      country: {
        type: DataTypes.STRING,
      },
      studentId: {
        type: DataTypes.INTEGER,
        allowNull: false,
      },
    },
    {
      tableName: "address_details", // matches your migration
      timestamps: true, // createdAt, updatedAt
    }
  );

  AddressDetail.associate = (models) => {
    AddressDetail.belongsTo(models.AuthUser, {
      foreignKey: "studentId",
      as: "student",
      onDelete: "CASCADE",
      onUpdate: "CASCADE",
    });
  };

  return AddressDetail;
};

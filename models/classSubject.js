'use strict';
const { Model } = require('sequelize');

module.exports = (sequelize, DataTypes) => {
  class ClassSubject extends Model {
    static associate(models) {
      // relations
      ClassSubject.belongsTo(models.Class, {
        foreignKey: 'classId',
        onDelete: 'CASCADE'
      });
      ClassSubject.belongsTo(models.Subject, {
        foreignKey: 'subjectId',
        onDelete: 'CASCADE'
      });
    }
  }

  ClassSubject.init(
    {
      id: {
        type: DataTypes.INTEGER,
        autoIncrement: true,
        primaryKey: true
      },
      classId: {
        type: DataTypes.INTEGER,
        allowNull: false
      },
      subjectId: {
        type: DataTypes.INTEGER,
        allowNull: false
      },
      isActive: {
        type: DataTypes.BOOLEAN,
        defaultValue: true
      },
      createdAt: {
        type: DataTypes.DATE,
        defaultValue: DataTypes.NOW
      },
      updatedAt: {
        type: DataTypes.DATE,
        defaultValue: DataTypes.NOW
      }
    },
    {
      sequelize,
      modelName: 'ClassSubject',
      tableName: 'ClassSubjects',
      indexes: [
        { fields: ['classId'], name: 'idx_class_subjects_class' },
        { fields: ['subjectId'], name: 'idx_class_subjects_subject' },
        { fields: ['isActive'], name: 'idx_class_subjects_active' }
      ],
      uniqueKeys: {
        unique_class_subject: {
          fields: ['classId', 'subjectId']
        }
      }
    }
  );

  return ClassSubject;
};
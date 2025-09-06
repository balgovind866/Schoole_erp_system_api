// models/ClassFee.js
module.exports = (sequelize, DataTypes) => {
  const ClassFee = sequelize.define("ClassFee", {
    id: {
      type: DataTypes.INTEGER,
      primaryKey: true,
      autoIncrement: true
    },
    feeStructureId: {
      type: DataTypes.INTEGER,
      allowNull: false,
      references: {
        model: 'fee_structures',
        key: 'id'
      }
    },
    feeCategoryId: {
      type: DataTypes.INTEGER,
      allowNull: false,
      references: {
        model: 'fee_categories',
        key: 'id'
      }
    },
    classId: {
      type: DataTypes.INTEGER,
      allowNull: false,
      references: {
        model: 'classes',
        key: 'id'
      }
    },
    amount: {
      type: DataTypes.DECIMAL(10, 2),
      allowNull: false
    },
    isActive: {
      type: DataTypes.BOOLEAN,
      defaultValue: true
    }
  }, {
    tableName: 'class_fees',
    timestamps: true,
    indexes: [
      {
        unique: true,
        fields: ['feeStructureId', 'feeCategoryId', 'classId']
      }
    ]
  });

  ClassFee.associate = (models) => {
    // Belongs to Fee Structure
    ClassFee.belongsTo(models.FeeStructure, {
      foreignKey: 'feeStructureId',
      as: 'feeStructure'
    });

    // Belongs to Fee Category
    ClassFee.belongsTo(models.FeeCategory, {
      foreignKey: 'feeCategoryId',
      as: 'category'
    });

    // Belongs to Class
    ClassFee.belongsTo(models.Class, {
      foreignKey: 'classId',
      as: 'class'
    });
  };

  return ClassFee;
};
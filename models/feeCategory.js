


module.exports = (sequelize, DataTypes) => {
  const FeeCategory = sequelize.define("FeeCategory", {
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
    name: {
      type: DataTypes.STRING,
      allowNull: false // e.g., "Admission Fees", "Security Fees", "Tuition Fees", "Bus Fees"
    },
    type: {
      type: DataTypes.ENUM('ADMISSION', 'TUITION', 'BUS', 'SECURITY', 'EXAM', 'SPORTS', 'LIBRARY', 'OTHER'),
      allowNull: false
    },
    amount: {
      type: DataTypes.DECIMAL(10, 2),
      allowNull: false,
      defaultValue: 0.00
    },
    isClassSpecific: {
      type: DataTypes.BOOLEAN,
      defaultValue: false // true if amount varies by class
    },
    isActive: {
      type: DataTypes.BOOLEAN,
      defaultValue: true
    },
    description: {
      type: DataTypes.TEXT,
      allowNull: true
    }
  }, {
    tableName: 'fee_categories',
    timestamps: true
  });

  FeeCategory.associate = (models) => {
    // Belongs to Fee Structure
    FeeCategory.belongsTo(models.FeeStructure, {
      foreignKey: 'feeStructureId',
      as: 'feeStructure'
    });

    // Has many class-specific fees (if isClassSpecific is true)
    FeeCategory.hasMany(models.ClassFee, {
      foreignKey: 'feeCategoryId',
      as: 'classFees'
    });
  };

  return FeeCategory;
};
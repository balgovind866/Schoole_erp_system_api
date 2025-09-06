module.exports = (sequelize, DataTypes) => {
  const FeeStructure = sequelize.define("FeeStructure", {
    id: {
      type: DataTypes.INTEGER,
      primaryKey: true,
      autoIncrement: true
    },
    schoolCode: {
      type: DataTypes.STRING,
      allowNull: false
    },
    sessionId: {
      type: DataTypes.INTEGER,
      allowNull: false,
      references: {
        model: 'sessions',
        key: 'id'
      }
    },
    name: {
      type: DataTypes.STRING,
      allowNull: false // e.g., "2013-14", "2024-25"
    },
    description: {
      type: DataTypes.TEXT,
      allowNull: true
    },
    isActive: {
      type: DataTypes.BOOLEAN,
      defaultValue: true
    },
    createdBy: {
      type: DataTypes.INTEGER,
      allowNull: true
    }
  }, {
    tableName: 'fee_structures',
    timestamps: true,
    indexes: [
      {
        unique: true,
        fields: ['schoolCode', 'sessionId', 'name']
      }
    ]
  });

  FeeStructure.associate = (models) => {
    // Belongs to School
    FeeStructure.belongsTo(models.SchoolAll, {
      foreignKey: 'schoolCode',
      targetKey: 'code',
      as: 'school'
    });

    // Belongs to Session
    FeeStructure.belongsTo(models.Session, {
      foreignKey: 'sessionId',
      as: 'session'
    });

    // Has many fee categories
    FeeStructure.hasMany(models.FeeCategory, {
      foreignKey: 'feeStructureId',
      as: 'categories'
    });

    // Has many class fees
    FeeStructure.hasMany(models.ClassFee, {
      foreignKey: 'feeStructureId',
      as: 'classFees'
    });

    // Created by user
    FeeStructure.belongsTo(models.AuthUser, {
      foreignKey: 'createdBy',
      as: 'creator'
    });
  };

  return FeeStructure;
};
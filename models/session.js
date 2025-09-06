// models/Session.js
module.exports = (sequelize, DataTypes) => {
  const Session = sequelize.define("Session", {
    id: {
      type: DataTypes.INTEGER,
      primaryKey: true,
      autoIncrement: true
    },
    schoolCode: {
      type: DataTypes.STRING,
      allowNull: false,
      references: {
        model: 'SchoolAll', // 👈 Must match the SchoolAll table
        key: 'code'
      }
    },
    name: {
      type: DataTypes.STRING,
      allowNull: true
    },
    start: {
      type: DataTypes.DATE,
      allowNull: true
    },
    enddate: {
      type: DataTypes.DATE,
      allowNull: true
    },
    isactive: {
      type: DataTypes.BOOLEAN,
      defaultValue: true
    }
  }, {
    tableName: "Sessions",
    timestamps: true
  });

  Session.associate = (models) => {
    // A session belongs to a school
    Session.belongsTo(models.SchoolAll, {
      foreignKey: "schoolCode",
      targetKey: "code",
      as: "school"
    });

    // A session has many fee structures
    Session.hasMany(models.FeeStructure, {
      foreignKey: "sessionId",
      as: "feeStructures"
    });
  };

  return Session;
};

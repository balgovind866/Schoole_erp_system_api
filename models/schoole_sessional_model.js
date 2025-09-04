
module.exports = (sequelize, DataTypes) => {
  const Session = sequelize.define("Session", {
    schoolCode: {
      type: DataTypes.STRING,
      allowNull: false
    },
    name: DataTypes.STRING,
      startDate: {
      type: DataTypes.DATE,
      field: "start"   // DB column is "start"
    },
     endDate: {
      type: DataTypes.DATE,
      field: "enddate" // DB column is "enddate"
    },
    isActive: DataTypes.BOOLEAN
  });
  
  Session.associate = (models) => {
    Session.belongsTo(models.SchoolAll, {
      foreignKey: 'schoolCode',
      targetKey: 'code'
    });
  };
  
  return Session;
};
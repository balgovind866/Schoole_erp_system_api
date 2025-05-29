
module.exports = (sequelize, DataTypes) => {
  const Session = sequelize.define("Session", {
    schoolCode: {
      type: DataTypes.STRING,
      allowNull: false
    },
    name: DataTypes.STRING,
    start: DataTypes.DATE,
    enddate: DataTypes.DATE,
    isactive: DataTypes.BOOLEAN
  });
  
  Session.associate = (models) => {
    Session.belongsTo(models.SchoolAll, {
      foreignKey: 'schoolCode',
      targetKey: 'code'
    });
  };
  
  return Session;
};
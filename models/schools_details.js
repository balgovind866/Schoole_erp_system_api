module.exports = (sequelize, DataTypes) => {
  const SchoolAll = sequelize.define("SchoolAll", {
    code: { type: DataTypes.STRING, unique: true, allowNull: false },
    name: { type: DataTypes.STRING, allowNull: false },
    baseUrl: { type: DataTypes.STRING, allowNull: false },
    logoPath: { type: DataTypes.STRING },
    bannerPath: { type: DataTypes.STRING },
    paymentLink: { type: DataTypes.STRING }
  });
  
  SchoolAll.associate = models => {
    // Fixed association - should be to Session model, not School
    SchoolAll.hasMany(models.Session, {
      foreignKey: 'schoolCode',
      sourceKey: 'code',
      as: 'sessions'
    });
  };
  
  return SchoolAll;
};
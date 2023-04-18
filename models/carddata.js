'use strict';
const {
  Model
} = require('sequelize');
module.exports = (sequelize, DataTypes) => {
  class Carddata extends Model {

    static associate({Orders}) {
      this.belongsTo(Orders,{as:"order",foreignKey:"orderId"})
    }
  }
  Carddata.init({
    mdOrderId: DataTypes.STRING,
    orderId: DataTypes.STRING,
    amount: DataTypes.REAL,
    status: DataTypes.STRING,
    socketId: DataTypes.STRING
  }, {
    sequelize,
    tableName:"carddata",
    modelName: 'Carddata',
  });
  return Carddata;
};
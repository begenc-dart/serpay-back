'use strict';
const {
  Model
} = require('sequelize');
module.exports = (sequelize, DataTypes) => {
  class Searchhistory extends Model {

    static associate(models) {
    }
  }
  Searchhistory.init({
    name: DataTypes.STRING,
    count: DataTypes.INTEGER
  }, {
    sequelize,
    tableName:"searchhistories",
    modelName: 'Searchhistory',
  });
  return Searchhistory;
};
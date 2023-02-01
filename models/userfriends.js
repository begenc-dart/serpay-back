 'use strict';
 const {
     Model
 } = require('sequelize');
 module.exports = (sequelize, DataTypes) => {
     class Userfriends extends Model {
         static associate(models) {}
     }

     Userfriends.init({
         user_id1: {
             type: DataTypes.STRING,
         },
         user_id2: {
             type: DataTypes.STRING,
             //  get: async function() {
             //  const user = await Users.findOne({ where: { user_id: this.getDataValue("user_id2") } })
             //  this.setDataValue("user_id2", user.nickname)
             //  }
         },
         nickname1: {
             type: DataTypes.STRING
         },
         nickname2: {
             type: DataTypes.STRING,
         },
         message: DataTypes.STRING
     }, {
         sequelize,
         tableName: "userfriends",
         modelName: 'Userfriends',
     });
     return Userfriends;
 };
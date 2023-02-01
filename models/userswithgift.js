'use strict';
const {
    Model
} = require('sequelize');
module.exports = (sequelize, DataTypes) => {
    class Userswithgift extends Model {
        static associate(models) {}
    }
    Userswithgift.init({
        phone_number: DataTypes.STRING,
        expire_date: DataTypes.STRING
    }, {
        sequelize,
        tableName: "userswitgift",
        modelName: 'Userswithgift',
    });
    return Userswithgift;
};
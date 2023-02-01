'use strict';
const {
    Model
} = require('sequelize');
module.exports = (sequelize, DataTypes) => {
    class Admin extends Model {

        static associate(models) {}
    }
    Admin.init({
        username: DataTypes.STRING,
        password: DataTypes.STRING
    }, {
        sequelize,
        tableName: "admin",
        modelName: 'Admin',
    });
    return Admin;
};
'use strict';
const {
    Model
} = require('sequelize');
module.exports = (sequelize, DataTypes) => {
    class Likedproducts extends Model {
        static associate(models) {}
    }
    Likedproducts.init({
        productId: DataTypes.INTEGER,
        userId: DataTypes.INTEGER
    }, {
        sequelize,
        tableName: "likedproducts",
        modelName: 'Likedproducts',
    });
    return Likedproducts;
};
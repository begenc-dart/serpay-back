'use strict';
const {
    Model
} = require('sequelize');
module.exports = (sequelize, DataTypes) => {
    class Sizes extends Model {

        static associate({ Products }) {}
    }
    Sizes.init({
        size: DataTypes.STRING
    }, {
        sequelize,
        tableName: "sizes",
        modelName: 'Sizes',
    });
    return Sizes;
};
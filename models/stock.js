'use strict';
const {
    Model
} = require('sequelize');
module.exports = (sequelize, DataTypes) => {
    class Stock extends Model {
        static associate({ Products, Productsizes }) {
            this.belongsTo(Products, { foreignKey: "productId", as: "product_stock", ondDelete: "cascade" })
            this.belongsTo(Productsizes, { foreignKey: "productsizeId", as: "product_size", onDelete: "cascade" })
        }
    }
    Stock.init({
        productId: DataTypes.INTEGER,
        productsizeId: DataTypes.INTEGER,
        quantity: DataTypes.INTEGER,
    }, {
        sequelize,
        tableName: "stocks",
        modelName: 'Stock',
    });
    return Stock;
};
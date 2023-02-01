'use strict';
const {
    Model
} = require('sequelize');
module.exports = (sequelize, DataTypes) => {
    class Productsizes extends Model {

        static associate({ Stock, Productcolor, Products }) {
            this.hasOne(Stock, { as: "product_size_stock", foreignKey: "productsizeId" })
            this.belongsTo(Productcolor, { as: "product_color", foreignKey: "productColorId" })
            this.belongsTo(Products, { as: "main_product", foreignKey: "productId" })
        }
    }
    Productsizes.init({
        product_size_id: {
            type: DataTypes.UUID,
            defaultValue: DataTypes.UUIDV4
        },
        productId: DataTypes.INTEGER,
        productColorId: DataTypes.INTEGER,
        size: DataTypes.STRING,
        price: DataTypes.REAL,
        price_old: DataTypes.REAL,
        price_tm: DataTypes.REAL,
        price_tm_old: DataTypes.REAL,
        price_usd: DataTypes.REAL,
        price_usd_old: DataTypes.REAL,
        discount: DataTypes.INTEGER
    }, {
        sequelize,
        tableName: "productsizes",
        modelName: 'Productsizes',
    });
    return Productsizes;
};
'use strict';
const {
    Model
} = require('sequelize');
module.exports = (sequelize, DataTypes) => {
    class Productcolor extends Model {

        static associate({ Images, Stock, Products, Productsizes }) {
            this.hasMany(Images, { as: "product_images", foreignKey: "productcolorId" })
            this.belongsTo(Products, { as: "main_product", foreignKey: "productId" })
            this.hasMany(Productsizes, { as: "product_sizes", foreignKey: "productColorId" })
        }
    }
    Productcolor.init({
        product_color_id: {
            type: DataTypes.UUID,
            defaultValue: DataTypes.UUIDV4
        },
        productId: {
            type: DataTypes.INTEGER
        },
        color_name_tm: DataTypes.STRING,
        color_name_ru: DataTypes.STRING,

    }, {
        sequelize,
        tableName: "productcolors",
        modelName: 'Productcolor',
    });
    return Productcolor;
};
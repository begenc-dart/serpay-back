'use strict';
const {
    Model
} = require('sequelize');
module.exports = (sequelize, DataTypes) => {
    class Details extends Model {

        static associate({ Products }) {
            this.belongsTo(Products, { as: "product", foreignKey: "productId" })
        }
    }
    Details.init({
        detail_id: {
            type: DataTypes.UUID,
            defaultValue: DataTypes.UUIDV4
        },
        image: DataTypes.STRING,
        productId: DataTypes.INTEGER
    }, {
        sequelize,
        tableName: "details",
        modelName: 'Details',
    });
    return Details;
};
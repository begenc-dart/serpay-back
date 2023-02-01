'use strict';
const {
    Model
} = require('sequelize');
module.exports = (sequelize, DataTypes) => {
    class Seller extends Model {
        /**
         * Helper method for defining associations.
         * This method is not a part of Sequelize lifecycle.
         * The `models/index` file will call this method automatically.
         */
        static associate({ Products, Orders }) {
            this.hasMany(Products, { as: "products", foreignKey: "sellerId" })
            this.hasMany(Orders, { as: "Orders", foreignKey: "sellerId" })
        }
    }
    Seller.init({
        seller_id: {
            type: DataTypes.UUID,
            defaultValue: DataTypes.UUIDV4
        },
        phone_number: DataTypes.STRING,
        phone_number_extra: DataTypes.STRING,
        name_tm: DataTypes.STRING,
        name_ru: DataTypes.STRING,
        image: DataTypes.STRING,
        password: DataTypes.STRING,
        nickname: DataTypes.STRING,
        address_tm: DataTypes.STRING,
        address_ru: DataTypes.STRING,
        isActive: DataTypes.BOOLEAN
    }, {
        sequelize,
        tableName: "sellers",
        modelName: 'Seller',
    });
    return Seller;
};
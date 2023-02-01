'use strict';
const {
    Model
} = require('sequelize');
module.exports = (sequelize, DataTypes) => {
    class Userhistory extends Model {

        static associate({ Users, Products }) {
            this.belongsTo(Users, { as: "user", foreignKey: "userId" })
            this.belongsTo(Products, { as: "product", foreignKey: "productId" })

        }
    }
    Userhistory.init({
        history_id: {
            type: DataTypes.UUID,
            defaultValue: DataTypes.UUIDV4
        },
        userId: DataTypes.INTEGER,
        productId: DataTypes.STRING
    }, {
        sequelize,
        tableName: "userhistories",
        modelName: 'Userhistory',
    });
    return Userhistory;
};
'use strict';
const {
    Model
} = require('sequelize');
module.exports = (sequelize, DataTypes) => {
    class Address extends Model {

        static associate({ Users }) {
            this.belongsTo(Users, { as: "user", foreignKey: "userId" })
        }
    }
    Address.init({
        address_id: {
            type: DataTypes.UUID,
            defaultValue: DataTypes.UUIDV4
        },
        welayat: DataTypes.STRING,
        address: DataTypes.STRING,
        userId: DataTypes.INTEGER
    }, {
        sequelize,
        tableName: "addresses",
        modelName: 'Address',
    });
    return Address;
};
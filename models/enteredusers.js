'use strict';
const {
    Model
} = require('sequelize');
module.exports = (sequelize, DataTypes) => {
    class Enteredusers extends Model {
        static associate(models) {}
    }
    Enteredusers.init({
        entereduser_id: {
            type: DataTypes.UUID,
            defaultValue: DataTypes.UUIDV4
        },
        entereduserId: DataTypes.INTEGER,
        isEntered: DataTypes.BOOLEAN,
        freeproductId: DataTypes.INTEGER,
        sharinguserId: DataTypes.INTEGER
    }, {
        sequelize,
        tableName: "enteredusers",
        modelName: 'Enteredusers',
    });
    return Enteredusers;
};
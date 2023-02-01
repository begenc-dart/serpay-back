'use strict';
const {
    Model
} = require('sequelize');
module.exports = (sequelize, DataTypes) => {
    class Colors extends Model {

        static associate(models) {}
    }
    Colors.init({
        color_id: {
            type: DataTypes.UUID,
            defaultValue: DataTypes.UUIDV4
        },
        name_tm: DataTypes.STRING,
        name_ru: DataTypes.STRING,
        hex: DataTypes.STRING
    }, {
        sequelize,
        tableName: "colors",
        modelName: 'Colors',
    });
    return Colors;
};
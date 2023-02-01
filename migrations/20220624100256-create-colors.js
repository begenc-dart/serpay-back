'use strict';
module.exports = {
    async up(queryInterface, DataTypes) {
        await queryInterface.createTable('colors', {
            id: {
                allowNull: false,
                autoIncrement: true,
                primaryKey: true,
                type: DataTypes.INTEGER
            },
            color_id: {
                type: DataTypes.UUID,
                defaultValue: DataTypes.UUIDV4
            },
            name_tm: {
                type: DataTypes.STRING
            },
            name_ru: {
                type: DataTypes.STRING
            },
            hex: {
                type: DataTypes.STRING
            },
            createdAt: {
                allowNull: false,
                type: DataTypes.DATE
            },
            updatedAt: {
                allowNull: false,
                type: DataTypes.DATE
            }
        });
    },
    async down(queryInterface, DataTypes) {
        await queryInterface.dropTable('colors');
    }
};
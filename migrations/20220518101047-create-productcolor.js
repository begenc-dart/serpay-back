'use strict';
module.exports = {
    async up(queryInterface, DataTypes) {
        await queryInterface.createTable('productcolors', {
            id: {
                allowNull: false,
                autoIncrement: true,
                primaryKey: true,
                type: DataTypes.INTEGER
            },
            product_color_id: {
                type: DataTypes.UUID,
                defaultValue: DataTypes.UUIDV4
            },
            productId: {
                type: DataTypes.INTEGER
            },
            color_name_tm:{
                type:DataTypes.STRING
            },
            color_name_ru:{
                type:DataTypes.STRING
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
        await queryInterface.dropTable('productcolors');
    }
};
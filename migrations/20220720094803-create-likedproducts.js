'use strict';
module.exports = {
    async up(queryInterface, DataTypes) {
        await queryInterface.createTable('likedproducts', {
            id: {
                allowNull: false,
                autoIncrement: true,
                primaryKey: true,
                type: DataTypes.INTEGER
            },
            productId: {
                type: DataTypes.INTEGER
            },
            userId: {
                type: DataTypes.INTEGER
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
        await queryInterface.dropTable('likedproducts');
    }
};
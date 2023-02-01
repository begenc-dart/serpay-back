'use strict';
module.exports = {
    async up(queryInterface, DataTypes) {
        await queryInterface.createTable('productsizes', {
            id: {
                allowNull: false,
                autoIncrement: true,
                primaryKey: true,
                type: DataTypes.INTEGER
            },
            product_size_id: {
                type: DataTypes.UUID,
                defaultValue: DataTypes.UUIDV4
            },
            productId: {
                type: DataTypes.INTEGER
            },
            productColorId: {
                type: DataTypes.INTEGER
            },
            size: {
                type: DataTypes.STRING
            },
            price: {
                type: DataTypes.REAL
            },
            price_old: {
                type: DataTypes.REAL
            },
            price_usd: {
                type: DataTypes.REAL
            },
            price_usd_old: {
                type: DataTypes.REAL
            },
            price_tm: {
                type: DataTypes.REAL
            },
            price_tm_old: {
                type: DataTypes.REAL
            },
            discount: {
                type: DataTypes.REAL
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
        await queryInterface.dropTable('productsizes');
    }
};
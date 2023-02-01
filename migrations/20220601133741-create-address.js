'use strict';
module.exports = {
    async up(queryInterface, DataTypes) {
        await queryInterface.createTable('addresses', {
            id: {
                allowNull: false,
                autoIncrement: true,
                primaryKey: true,
                type: DataTypes.INTEGER
            },
            address_id: {
                type: DataTypes.UUID,
                defaultValue: DataTypes.UUIDV4
            },
            welayat: {
                type: DataTypes.STRING
            },
            address: {
                type: DataTypes.STRING
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
        await queryInterface.dropTable('addresses');
    }
};
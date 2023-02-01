'use strict';
module.exports = {
    async up(queryInterface, DataTypes) {
        await queryInterface.createTable('cards', {
            id: {
                allowNull: false,
                autoIncrement: true,
                primaryKey: true,
                type: DataTypes.INTEGER
            },
            card_id: {
                type: DataTypes.UUID
            },
            card_number: {
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
        await queryInterface.dropTable('cards');
    }
};
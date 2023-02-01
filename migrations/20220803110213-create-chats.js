'use strict';
module.exports = {
    async up(queryInterface, DataTypes) {
        await queryInterface.createTable('chats', {
            id: {
                allowNull: false,
                autoIncrement: true,
                primaryKey: true,
                type: DataTypes.INTEGER
            },
            user_id1: {
                type: DataTypes.STRING
            },
            user_id2: {
                type: DataTypes.STRING
            },
            text: {
                type: DataTypes.STRING
            },
            isYou: {
                type: DataTypes.BOOLEAN,
                defaultValue: false
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
        await queryInterface.dropTable('chats');
    }
};
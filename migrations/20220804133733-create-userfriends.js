'use strict';
module.exports = {
    async up(queryInterface, DataTypes) {
        await queryInterface.createTable('userfriends', {
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
            nickname1: {
                type: DataTypes.STRING
            },
            nickname2: {
                type: DataTypes.STRING
            },
            message: {
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
        await queryInterface.dropTable('userfriends');
    }
};
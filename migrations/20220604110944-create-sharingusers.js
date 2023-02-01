'use strict';
module.exports = {
    async up(queryInterface, DataTypes) {
        await queryInterface.createTable('sharingusers', {
            id: {
                allowNull: false,
                autoIncrement: true,
                primaryKey: true,
                type: DataTypes.INTEGER
            },
            sharinguser_id: {
                type: DataTypes.UUID,
                defaultValue: DataTypes.UUIDV4
            },
            userId: {
                type: DataTypes.INTEGER
            },
            freeproductId: {
                type: DataTypes.INTEGER
            },
            count: {
                type: DataTypes.INTEGER,
                defaultValue: 0
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
        await queryInterface.dropTable('sharingusers');
    }
};
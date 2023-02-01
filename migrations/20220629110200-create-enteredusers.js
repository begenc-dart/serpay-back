'use strict';


module.exports = {
    async up(queryInterface, DataTypes) {
        await queryInterface.createTable('enteredusers', {
            id: {
                allowNull: false,
                autoIncrement: true,
                primaryKey: true,
                type: DataTypes.INTEGER
            },
            entereduser_id: {
                type: DataTypes.UUID,
                defaultValue: DataTypes.UUIDV4
            },
            entereduserId: DataTypes.INTEGER,
            isEntered: {
                type: DataTypes.BOOLEAN
            },
            freeproductId: {
                type: DataTypes.INTEGER
            },
            sharinguserId: {
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
        await queryInterface.dropTable('enteredusers');
    }
};
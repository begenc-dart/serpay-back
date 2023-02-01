'use strict';


module.exports = {
    async up(queryInterface, DataTypes) {
        await queryInterface.createTable('sellers', {
            id: {
                allowNull: false,
                autoIncrement: true,
                primaryKey: true,
                type: DataTypes.INTEGER
            },
            seller_id: {
                type: DataTypes.UUID,
                defaultValue: DataTypes.UUIDV4
            },
            phone_number: {
                type: DataTypes.STRING
            },
            phone_number_extra: {
                type: DataTypes.STRING
            },
            name_tm: {
                type: DataTypes.STRING
            },
            name_ru: {
                type: DataTypes.STRING
            },
            image: {
                type: DataTypes.STRING
            },
            address_tm: {
                type: DataTypes.STRING
            },
            address_ru: {
                type: DataTypes.STRING
            },
            password: {
                type: DataTypes.STRING
            },
            isActive: {
                type: DataTypes.BOOLEAN
            },
            nickname: {
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
        await queryInterface.dropTable('sellers');
    }
};
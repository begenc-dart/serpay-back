'use strict';



module.exports = {
    async up(queryInterface, DataTypes) {
        await queryInterface.createTable('freeproducts', {
            id: {
                allowNull: false,
                autoIncrement: true,
                primaryKey: true,
                type: DataTypes.INTEGER
            },
            freeproduct_id: {
                type: DataTypes.UUID,
                defaultValue: DataTypes.UUIDV4
            },
            name_tm: {
                type: DataTypes.STRING
            },
            name_ru: {
                type: DataTypes.STRING
            },
            body_tm: {
                type: DataTypes.STRING
            },
            body_ru: {
                type: DataTypes.STRING
            },
            expire_date: {
                type: DataTypes.STRING
            },
            link: {
                type: DataTypes.STRING
            },
            goal: {
                type: DataTypes.INTEGER
            },
            max: {
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
        await queryInterface.dropTable('freeproducts');
    }
};
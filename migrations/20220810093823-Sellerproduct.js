'use strict';

module.exports = {
    async up(queryInterface, DataTypes) {
        await queryInterface.addColumn(
            "products",
            "sellerId", { type: DataTypes.INTEGER }
        )
    },

    async down(queryInterface, DataTypes) {
        await queryInterface.removeColumn(
            "products",
            "sellerId"
        )
    }
};
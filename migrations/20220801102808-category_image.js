'use strict';

module.exports = {
    async up(queryInterface, DataTypes) {
        queryInterface.addColumn(
            "categories",
            "image",
            DataTypes.STRING
        )
    },

    async down(queryInterface, DataTypes) {
        queryInterface.removeColumn(
            "categories",
            "image"
        )
    }
};
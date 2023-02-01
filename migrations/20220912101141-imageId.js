'use strict';
module.exports = {
    async up(queryInterface, DataTypes) {
        await queryInterface.addColumn(
            "images",
            "image_id", { type: DataTypes.UUID, defaultValue: DataTypes.UUIDV4 }
        )
    },

    async down(queryInterface, DataTypes) {
        /**
         * Add reverting commands here.
         *
         * Example:
         * await queryInterface.dropTable('users');
         */
    }
};
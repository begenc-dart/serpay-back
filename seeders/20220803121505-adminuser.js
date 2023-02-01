'use strict';
const bcrypt = require("bcryptjs")
module.exports = {
    async up(queryInterface, Sequelize) {
        await queryInterface.bulkInsert(
            'users', [{
                username: 'admin',
                nickname: "admin",
                password: await bcrypt.hash('serpayadmin', 12),
                createdAt: Sequelize.fn('now'),
                updatedAt: Sequelize.fn('now'),
            }, ], {}
        );
    },

    async down(queryInterface, Sequelize) {
        await queryInterface.bulkDelete('users', null, {});
    }
};
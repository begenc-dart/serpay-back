'use strict';


module.exports = {
  async up (queryInterface, DataTypes) {
    await queryInterface.addColumn(
      "products",
      "note",
      {type:DataTypes.STRING},
    )
  },

  async down (queryInterface, DataTypes) {
    /**
     * Add reverting commands here.
     *
     * Example:
     * await queryInterface.dropTable('users');
     */
  }
};

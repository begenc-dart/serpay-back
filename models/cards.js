'use strict';
const {
    Model
} = require('sequelize');
const CryptoJS = require("crypto-js")

module.exports = (sequelize, DataTypes) => {
    class Cards extends Model {

        static associate({ Users }) {
            this.belongsTo(Users, { as: "user", foreignKey: "userId" })
        }
    }
    Cards.init({
        card_id: {
            type: DataTypes.UUID,
            defaultValue: DataTypes.UUIDV4,
        },
        card_number: {
            type: DataTypes.STRING,
            get: function() {
                var bytes = CryptoJS.AES.decrypt(this.getDataValue("card_number"), 'mary jane');
                var originalText = bytes.toString(CryptoJS.enc.Utf8);
                return originalText;
            },
            set: function(value) {
                var ciphertext = CryptoJS.AES.encrypt(value, 'mary jane').toString();
                this.setDataValue("card_number", ciphertext);
            },
        },
        userId: DataTypes.INTEGER
    }, {
        sequelize,
        tableName: "cards",
        modelName: 'Cards',
    });
    return Cards;
};
'use strict';
const {
    Model,
} = require('sequelize');
const CryptoJS = require("crypto-js")
module.exports = (sequelize, DataTypes) => {
    class Chats extends Model {
        static associate(models) {}
    }
    Chats.init({
        user_id1: DataTypes.STRING,
        user_id2: DataTypes.STRING,
        isYou: DataTypes.BOOLEAN,
        text: {
            type: DataTypes.STRING,
            get: function() {
                var bytes = CryptoJS.AES.decrypt(this.getDataValue("text"), 'mary jane');
                var originalText = bytes.toString(CryptoJS.enc.Utf8);
                return originalText;
            },
            set: function(value) {
                var ciphertext = CryptoJS.AES.encrypt(value, 'mary jane').toString();
                this.setDataValue("text", ciphertext);
            },
        }
    }, {
        sequelize,
        tableName: "chats",
        modelName: 'Chats',
    });
    return Chats;
};
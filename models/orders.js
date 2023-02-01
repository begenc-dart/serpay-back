'use strict';
const {
    Model
} = require('sequelize');
module.exports = (sequelize, DataTypes) => {
    class Orders extends Model {
        static associate({ Orderproducts, Users, Seller }) {
            this.hasMany(Orderproducts, { foreignKey: "orderId", as: "order_products" })
            this.belongsTo(Users, { foreignKey: "userId", as: "user" })
            this.belongsTo(Seller, { foreignKey: "sellerId", as: "seller" })
        }
    }
    Orders.init({
        order_id: {
            type: DataTypes.UUID,
            defaultValue: DataTypes.UUIDV4,
        },
        userId: DataTypes.INTEGER,
        sellerId: DataTypes.INTEGER,
        total_price: DataTypes.REAL,
        total_quantity: DataTypes.INTEGER,
        user_name: {
            type: DataTypes.STRING,
            allowNull: false,
            validate: {
                notNull: {
                    msg: "User name cannot be null",
                },
                notEmpty: {
                    msg: "User name cannot be empty",
                },
            },
        },
        user_phone: {
            type: DataTypes.STRING,
            allowNull: false,
            validate: {
                notNull: {
                    msg: "User phone cannot be null",
                },
                notEmpty: {
                    msg: "User phone cannot be empty",
                },
            },
        },
        payment_type: DataTypes.STRING,
        i_take: DataTypes.BOOLEAN,
        address: {
            type: DataTypes.STRING,
            allowNull: false,
            validate: {
                notNull: {
                    msg: "Address cannot be null",
                },
                notEmpty: {
                    msg: "Address cannot be empty",
                },
            },
        },
        status: DataTypes.STRING,
        delivery_time: {
            type: DataTypes.STRING,
            allowNull: false,
            validate: {
                notNull: {
                    msg: "Delivery time cannot be null",
                },
                notEmpty: {
                    msg: "Delivery time cannot be empty",
                },
            },
        },
        note: DataTypes.STRING
    }, {
        sequelize,
        tableName: "orders",
        modelName: 'Orders',
    });
    return Orders;
};
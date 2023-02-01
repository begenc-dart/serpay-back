'use strict';
const {
    Model
} = require('sequelize');
module.exports = (sequelize, DataTypes) => {
    class Products extends Model {
        static associate({ Users, Categories, Subcategories, Stock, Images, Brands, Productcolor, Productsizes, Userhistory, Details, Seller }) {
            this.belongsTo(Categories, { foreignKey: "categoryId", as: "category" })
            this.belongsTo(Subcategories, { foreignKey: "subcategoryId", as: "subcategory" })
            this.hasMany(Stock, { foreignKey: "productId", as: "product_stock" })
            this.hasMany(Images, { foreignKey: "productId", as: "images" })
            this.hasMany(Productcolor, { foreignKey: "productId", as: "product_colors" })
            this.hasMany(Productsizes, { foreignKey: "productId", as: "product_sizes" })
            this.belongsTo(Brands, { foreignKey: "brandId", as: "brand" })
            this.hasMany(Userhistory, { foreignKey: "productId", as: "userhistory" })
            this.belongsToMany(Users, { through: "Likedproducts", as: "liked_users", foreignKey: "productId" })
            this.hasMany(Details, { as: "details", foreignKey: "productId" })
            this.belongsTo(Seller, { as: "seller", foreignKey: "sellerId" })
        }
    }
    Products.init({
        product_id: {
            type: DataTypes.UUID,
            defaultValue: DataTypes.UUIDV4
        },
        name_tm: {
            type: DataTypes.STRING,
            allowNull: false,
            validate: {
                notNull: {
                    msg: "Product cannot be null",
                },
                notEmpty: {
                    msg: "Product cannot be empty",
                },
            },
        },
        name_ru: {
            type: DataTypes.STRING,
            allowNull: false,
            validate: {
                notNull: {
                    msg: "Product cannot be null",
                },
                notEmpty: {
                    msg: "Product cannot be empty",
                },
            },
        },
        body_tm: {
            type: DataTypes.TEXT,
            allowNull: false,
            validate: {
                notNull: {
                    msg: "Product description cannot be null",
                },
                notEmpty: {
                    msg: "Product description cannot be empty",
                },
            },
        },
        body_ru: {
            type: DataTypes.TEXT,
            allowNull: false,
            validate: {
                notNull: {
                    msg: "Product description cannot be null",
                },
                notEmpty: {
                    msg: "Product description cannot be empty",
                },
            },
        },
        product_code: {
            type: DataTypes.STRING,
            allowNull: false,
            validate: {
                notNull: {
                    msg: "Product code cannot be null",
                },
                notEmpty: {
                    msg: "Product code cannot be empty",
                },
            },
        },
        price: DataTypes.REAL,
        price_old: DataTypes.REAL,
        price_tm: DataTypes.REAL,
        price_tm_old: DataTypes.REAL,
        price_usd: DataTypes.REAL,
        price_usd_old: DataTypes.REAL,
        discount: DataTypes.REAL,
        product_code: DataTypes.STRING,
        isActive: DataTypes.BOOLEAN,
        sex: {
            type: DataTypes.STRING,
            defaultValue: "-"
        },
        isNew: {
            type: DataTypes.BOOLEAN,
            defaultValue: true
        },
        isAction: DataTypes.BOOLEAN,
        rating: {
            type: DataTypes.REAL,
            defaultValue: 0
        },
        rating_count: {
            type: DataTypes.INTEGER,
            defaultValue: 0
        },
        sold_count: {
            type: DataTypes.INTEGER,
            defaultValue: 0
        },
        likeCount: {
            type: DataTypes.INTEGER,
            defaultValue: 0
        },
        is_new_expire: {
            type: DataTypes.BIGINT
        },
        isLiked: {
            type: DataTypes.BOOLEAN,
            defaultValue: false
        },
        note:DataTypes.STRING,
        categoryId: DataTypes.INTEGER,
        subcategoryId: DataTypes.INTEGER,
        brandId: DataTypes.INTEGER,
        sellerId: DataTypes.INTEGER
    }, {
        sequelize,
        tableName: "products",
        modelName: 'Products',
    });
    return Products;
};
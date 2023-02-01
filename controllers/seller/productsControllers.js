const fs = require('fs');
const sharp = require('sharp');
const { v4 } = require("uuid")
const Op = require('sequelize').Op;
const AppError = require('../../utils/appError');
const catchAsync = require('../../utils/catchAsync');
const { getDate } = require("../../utils/date")
const {
    Products,
    Categories,
    Subcategories,
    Stock,
    Currency,
    Brands,
    Images,
    Productsizes,
    Productcolor,
    Colors,
    Details
} = require('../../models');
const capitalize = function(string) {
    return string.charAt(0).toUpperCase() + string.slice(1);
};
exports.getAllActiveProducts = catchAsync(async(req, res) => {
    const limit = req.query.limit || 20;
    const offset = req.query.offset || 0;
    let { keyword, categoryId, subcategoryId } = req.query;
    var where = {};
    if (keyword && keyword != "undefined") {
        let keywordsArray = [];
        keyword = keyword.toLowerCase();
        keywordsArray.push('%' + keyword + '%');
        keyword = '%' + capitalize(keyword) + '%';
        keywordsArray.push(keyword);
        where = {
            [Op.or]: [{
                    name_tm: {
                        [Op.like]: {
                            [Op.any]: keywordsArray,
                        },
                    },
                },
                {
                    name_ru: {
                        [Op.like]: {
                            [Op.any]: keywordsArray,
                        },
                    },
                },
            ],
        };
    }

    if (categoryId) where.categoryId = categoryId;
    if (subcategoryId) where.subcategoryId = subcategoryId;
    where.sellerId = req.seller.id
    const products = await Products.findAll({
        where,
        limit,
        offset,
        include: {
            model: Images,
            as: "images",
            limit: 4
        },
        order: [
            ['id', 'DESC'],
            // ["images", "id", "DESC"]
        ],
    });
    const count = await Products.count()
    return res.status(200).send({ products, count });
});
exports.getOneProduct = catchAsync(async(req, res, next) => {
    const { product_id } = req.params
    const oneProduct = await Products.findOne({
        where: { product_id },
        include: [{
                model: Productcolor,
                as: "product_colors",
                include: [{
                        model: Images,
                        as: "product_images"
                    },
                    {
                        model: Productsizes,
                        as: "product_sizes"

                    }
                ]
            },
            {
                model: Productsizes,
                as: "product_sizes"
            },
            {
                model: Details,
                as: "details"
            },
            {
                model: Images,
                as: "images"
            },
            {
                model: Categories,
                as: "categories"
            },
            {
                model: Subcategories,
                as: "subcategory"
            }
        ]
    })
    return res.send(oneProduct)
})
exports.addProduct = catchAsync(async(req, res, next) => {
    const category = await Categories.findOne({
        where: { category_id: req.body.category_id },
    });
    req.body.isActive = false
    if (!category)
        return next(new AppError('Category did not found with that ID', 404));
    if (req.body.subcategory_id) {
        const subcategory = await Subcategories.findOne({
            where: { subcategory_id: [req.body.subcategory_id] },
        });
        if (!subcategory)
            return next(new AppError('Sub-category did not found with that ID', 404));
        req.body.subcategoryId = subcategory.id;
    }
    if (req.body.brand_id) {
        const brand = await Brands.findOne({
            where: { brand_id: req.body.brand_id }
        })
        if (!brand)
            return next(new AppError("Brand did not found with that Id"), 404)
        req.body.brandId = brand.id
    }
    const date = new Date()
    req.body.is_new_expire = date.getTime()
    req.body.stock = Number(req.body.stock)
    req.body.categoryId = category.id;
    if (req.body.price_usd) {
        req.body.price_tm = null
        req.body.price_tm_old = null
        req.body.price_old = null
        req.body.price_usd_old = null
        let currency = await Currency.findOne()
        if (req.body.discount > 0) {
            req.body.price_usd_old = req.body.price_usd;
            req.body.price_usd =
                (req.body.price_usd_old / 100) *
                (100 - req.body.discount);
            req.body.price_old =
                req.body.price_usd_old * currency.value;
        }
        req.body.price = req.body.price_usd * currency.value
    } else {
        req.body.price_usd = null;
        req.body.price_usd_old = null;
        req.body.price_old = null;
        req.body.price_tm_old = null
        if (req.body.discount > 0) {
            req.body.price_tm_old = req.body.price_tm;
            req.body.price_tm =
                (req.body.price_tm_old / 100) *
                (100 - req.body.discount);
            req.body.price_old = req.body.price_tm_old;
        }
        req.body.price = req.body.price_tm;
    }
    req.body.sellerId = req.seller.id
    const newProduct = await Products.create(req.body);
    let stock_data = {}

    if (req.body.quantity) {
        stock_data.quantity = req.body.quantity
        stock_data.productId = newProduct.id
        await Stock.create(stock_data)
    }
    return res.status(201).send(newProduct)
})
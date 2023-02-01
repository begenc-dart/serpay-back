const { Op } = require('sequelize');
const {
    Products,
    Categories,
    Stock,
    Brands,
    Productcolor,
    Productsizes,
    Images,
    Details,
    Users,
    Likedproducts,
    Subcategories,
    Orderproducts
} = require('../../models');
const catchAsync = require('../../utils/catchAsync');
const AppError = require('../../utils/appError');
exports.getProducts = catchAsync(async(req, res) => {
    const limit = req.query.limit || 10;
    const { offset } = req.query;
    var order, where;

    let products = await Products.findAll({
        isActive: true,
        order,
        limit,
        offset,
        include: [{
                model: Images,
                as: "images"
            },
            {
                model: Productsizes,
                as: "product_sizes",
            }
        ],
        where
    });
    products = await isLiked(products, req)
    return res.status(200).json(products);
});
exports.getOneProduct = catchAsync(async(req, res, next) => {
    const product_id = req.params.id
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
                        as: "product_sizes",
                        include: {
                            model: Stock,
                            as: "product_size_stock"
                        }
                    }
                ]
            },
            {
                model: Productsizes,
                as: "product_sizes",
                include: {
                    model: Stock,
                    as: "product_size_stock"
                }
            },
            {
                model: Stock,
                as: "product_stock",
                limit: 1
            },
            {
                model: Images,
                as: "images"
            },
            {
                model: Details,
                as: "details"
            },
            {
                model: Brands,
                as: "brand"
            }
        ]
    })
    if (!oneProduct) {
        return next(new AppError("Can't find product with that id"), 404);
    }
    const id = oneProduct.categoryId
    let recommenendations = await Categories.findOne({
        where: { id },
        include: {
            model: Products,
            as: "products",
            where: {
                id: {
                    [Op.ne]: oneProduct.id
                }
            },
            limit: 4,
            order: [
                ["id", "DESC"]
            ],
            include: {
                model: Images,
                as: "images",
            }
        }
    })
    const liked_product = await Likedproducts.findOne({
        where: {
            [Op.and]: [{ productId: oneProduct.id }, { userId: req.user.id }]
        }
    })
    if (liked_product) oneProduct.isLiked = true

    recommenendations = await isLiked(recommenendations, req)
    const product = {
        oneProduct,
        recommenendations,
    }
    return res.send({ product })
})
exports.getTopProducts = catchAsync(async(req, res) => {
    const limit = req.query.limit || 10;
    const offset = req.query.ofsset || 0
    const { isAction, discount, } = req.query;
    var order, where = {};
    where = getWhere(req.query)
    if (discount && discount != "false") {
        let discount = {
            [Op.ne]: 0
        }
        where.push({ discount })
    }

    if (isAction) where.push({ isAction })
    order.push(["sold_count", "DESC"])
    let products = await Products.findAll({
        isActive: true,
        limit,
        offset,
        order,
        include: {
            model: Images,
            as: "images"
        },
    });
    products = await isLiked(products, req)

    return res.status(200).json(products);
});
exports.getLikedProducts = catchAsync(async(req, res) => {
    const limit = req.query.limit || 10;
    const offset = req.query.offset || 0;
    const { sort, isAction, discount } = req.query;
    var order, where = [];
    if (sort == 1) {
        order = [
            ['price', 'DESC']
        ];
    } else if (sort == 0) {
        order = [
            ['price', 'ASC']
        ];
    } else if (sort == 3) {
        order = [
            ["sold_count", "DESC"]
        ]
    } else order = [
        ['updatedAt', 'DESC']
    ];
    where = getWhere(req.query)
    if (discount && discount != "false") {
        let discount = {
            [Op.ne]: 0
        }
        where.push({ discount })
    }

    if (isAction) where.push({ isAction })
    order.push(["likeCount", "DESC"])
    let products = await Products.findAll({
        isActive: true,
        order,
        limit,
        offset,
        where,
        include: {
            model: Images,
            as: "images"
        },
    });
    products = await isLiked(products, req)
    return res.status(200).send({ products })
});
// Search
const capitalize = function(string) {
    return string.charAt(0).toUpperCase() + string.slice(1);
};
exports.searchProducts = catchAsync(async(req, res, next) => {
    const limit = req.query.limit || 20;
    let { keyword, offset, sort } = req.query;
    var order;
    if (sort == 1) {
        order = [
            ['price', 'DESC']
        ];
    } else if (sort == 0) {
        order = [
            ['price', 'ASC']
        ];
    } else order = [
        ['updatedAt', 'DESC']
    ];

    let keywordsArray = [];
    keyword = keyword.toLowerCase();
    keywordsArray.push('%' + keyword + '%');
    keyword = '%' + capitalize(keyword) + '%';
    keywordsArray.push(keyword);
    const products = await Products.findAll({
        where: {
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
            isActive: true,
        },
        order,
        limit,
        offset,
    });

    return res.status(200).send({ products });
});
exports.discount = catchAsync(async(req, res, next) => {
    const limit = req.query.limit || 20;
    const offset = req.query.offset || 0;
    const { sort, isAction, max_price, min_price, sex } = req.query
    let order, where = {}
    if (sort == 1) {
        order = [
            ['price', 'DESC']
        ];
    } else if (sort == 0) {
        order = [
            ['price', 'ASC']
        ];
    } else if (sort == 3) {
        order = [
            ["sold_count", "DESC"]
        ]
    } else order = [
        ['updatedAt', 'DESC']
    ];
    where = getWhere(req.query)
    let discount = {
        [Op.ne]: 0
    }
    where.push({ discount })


    if (isAction) where.push({ isAction })
    let discount_products = await Products.findAll({
        where,
        order,
        limit,
        offset,
        include: [{
            model: Images,
            as: "images"
        }],

    });
    discount_products = await isLiked(discount_products, req)
    const count = await Products.count({ where })
    return res.status(200).send({ discount_products, count })
})
exports.actionProducts = catchAsync(async(req, res, next) => {
    const limit = req.query.limit || 20;
    const offset = req.query.offset || 0;
    const { sort, discount } = req.query
    let order, where = {}
    if (sort == 1) {
        order = [
            ['price', 'DESC']
        ];
    } else if (sort == 0) {
        order = [
            ['price', 'ASC']
        ];
    } else if (sort == 3) {
        order = [
            ["sold_count", "DESC"]
        ]
    } else order = [
        ['updatedAt', 'DESC']
    ];
    where = getWhere(req.query)
    if (discount && discount != "false") {
        let discount = {
            [Op.ne]: 0
        }
        where.push({ discount })
    }

    where.push({ isAction: true })

    let action_products = await Products.findAll({
        where,
        order,
        limit,
        offset,
        include: [{
            model: Images,
            as: "images"
        }, ]
    });
    const count = await Products.count({ where })
    action_products = await isLiked(action_products, req)
    return res.status(200).send({ action_products, count })
})
exports.newProducts = catchAsync(async(req, res) => {
    const limit = req.query.limit || 20;
    const offset = req.query.offset || 0;
    const { sort, discount, isAction } = req.query
    let order, where = {}
    if (sort == 1) {
        order = [
            ['price', 'DESC']
        ];
    } else if (sort == 0) {
        order = [
            ['price', 'ASC']
        ];
    } else if (sort == 3) {
        order = [
            ["sold_count", "DESC"]
        ]
    } else order = [
        ['updatedAt', 'DESC']
    ];
    where = getWhere(req.query)
    if (discount && discount != "false") {
        let discount = {
            [Op.ne]: 0
        }
        where.push({ discount })
    }
    if (discount && discount != "false") {
        let discount = {
            [Op.ne]: 0
        }
        where.push({ discount })
    }
    if (isAction) where.push({ isAction })
    where.push({ isNew: true })
    let new_products = await Products.findAll({
        where,
        limit,
        offset,
        include: [{
            model: Images,
            as: "images",
        }],
        order,
    })
    new_products = await isLiked(new_products, req)
    const count = await Products.count({ where })
    return res.status(200).send({ new_products, count });
});
exports.getBrandProducts = catchAsync(async(req, res, next) => {
    const brand = await Brands.findOne({ where: { brand_id: req.params.id } });

    if (!brand)
        return next(new AppError('Brand did not found with that ID', 404));

    const limit = req.query.limit || 20;
    const offset = req.query.offset;
    const sort = req.query.sort;

    var order;
    if (sort == 1) {
        order = [
            ['price', 'DESC']
        ];
    } else if (sort == 0) {
        order = [
            ['price', 'ASC']
        ];
    } else order = [
        ['updatedAt', 'DESC']
    ];

    let products = await Products.findAll({
        where: { brandId: brand.id }, //isActive goy son
        order,
        limit,
        offset,
        include: [{
                model: Images,
                as: "images"
            },
            {
                model: Productsizes,
                as: "product_sizes"
            }
        ]
    });
    products = await isLiked(products, req)
    const count = await Products.count({ where: { brandId: brand.id } })
    return res.status(200).send({ products, count });
});
exports.getCategoryProducts = catchAsync(async(req, res, next) => {
    const category = await Categories.findOne({
        where: { category_id: req.params.id },
    });

    if (!category)
        return next(new AppError('Category did not found with that ID', 404));

    const limit = req.query.limit || 20;
    const offset = req.query.offset;
    const sort = req.query.sort;

    var order;
    if (sort == 1) {
        order = [
            ['price', 'DESC']
        ];
    } else if (sort == 0) {
        order = [
            ['price', 'ASC']
        ];
    } else order = [
        ['updatedAt', 'DESC']
    ];
    order.push(["images", "id", "DESC"])
    let products = await Products.findAll({
        where: { categoryId: category.id }, //isActive goy sonundan
        order,
        limit,
        offset,
        include: [{
            model: Images,
            as: "images"
        }]
    });
    products = await isLiked(products, req)
    const count = await Products.count({ where: { categoryId: category.id } })
    return res.status(200).send({ products, count });
});
exports.getSubcategoryProducts = catchAsync(async(req, res, next) => {
    const subcategory = await Subcategories.findOne({
        where: { subcategory_id: req.params.id },
        include: {
            model: Categories,
            as: "category"
        }
    });
    if (!subcategory)
        return next(new AppError('Sub-category did not found with that ID', 404));
    const limit = req.query.limit || 20;
    const offset = req.query.offset;
    const { is_new, max_price, min_price, sex, discount, sort } = req.query
    var order, where = {};
    if (sort == 1) {
        order = [
            ['price', 'DESC']
        ];
    } else if (sort == 0) {
        order = [
            ['price', 'ASC']
        ];
    } else if (sort == 3) {
        order = [
            ["sold_count", "DESC"]
        ]
    } else order = [
        ['updatedAt', 'DESC']
    ];
    if (is_new == "true") {
        where.isNew = true
    }
    if (max_price && min_price == undefined) {
        where.price = {
            [Op.lte]: max_price
        }
    } else if (max_price == undefined && min_price) {
        where.price = {
            [Op.gte]: min_price
        }
    } else if (max_price && min_price) {
        where = {
            [Op.and]: [{
                    price: {
                        [Op.gte]: min_price
                    }
                },
                {
                    price: {
                        [Op.lte]: max_price
                    }
                }
            ]
        }
    }
    if (sex) {
        sex.split = (",")
        var array = []
        for (let i = 0; i < sex.length; i++) {
            array.push({
                sex: {
                    [Op.eq]: sex[i]
                }
            })
        }
        where = {
            [Op.or]: array
        }
    }
    if (discount && discount != "false") where.discount = {
        [Op.ne]: 0
    }
    where.subcategoryId = subcategory.id
    order.push(["images", "id", "DESC"])
    var products = await Products.findAll({
        where, //isActive goy
        order,
        limit,
        offset,
        include: [{
            model: Images,
            as: "images"
        }]
    });
    const count = await Products.count({ where })
    products = await isLiked(products, req)
    return res.status(200).send({ products, count, subcategory });
});
async function isLiked(products, req) {
    for (let i = 0; i < products.length; i++) {
        const liked_ids = await Likedproducts.findOne({
            where: {
                [Op.and]: [{ userId: req.user.id }, { productId: products[i].id }]
            }
        })
        if (liked_ids) products[i].isLiked = true
    }
    return products
}

function getWhere({ max_price, min_price, sex }) {
    let where = []
    if (max_price && min_price == "") {
        let price = {
            [Op.lte]: max_price
        }
        where.push({ price })
    } else if (max_price == "" && min_price) {
        let price = {
            [Op.gte]: min_price
        }
        where.push({ price })

    } else if (max_price && min_price) {
        let price = {
            [Op.and]: [{
                    price: {
                        [Op.gte]: min_price
                    }
                },
                {
                    price: {
                        [Op.lte]: max_price
                    }
                }
            ],
        }
        where.push(price)
    }
    if (sex) {
        sex.split = (",")
        var array = []
        for (let i = 0; i < sex.length; i++) {
            array.push({
                sex: {
                    [Op.eq]: sex[i]
                }
            })
        }
        where.push(array)

    }
    return where
}
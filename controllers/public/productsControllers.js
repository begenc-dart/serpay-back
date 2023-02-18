const { Op } = require('sequelize');
const {
    Products,
    Categories,
    Subcategories,
    Stock,
    Brands,
    Productcolor,
    Productsizes,
    Images,
    Details,
    Seller,
    Searchhistory
} = require('../../models');
const catchAsync = require('../../utils/catchAsync');
const AppError = require('../../utils/appError');
const {isUUID}=require("validator")
exports.getProducts = catchAsync(async(req, res) => {
    const limit = req.query.limit || 10;
    const { offset } = req.query;
    var order, where;
    const products = await Products.findAll({
        isActive: true,
        order,
        limit,
        offset,
        include: [{
            model: Images,
            as: "images"
        }, ],
        where
    });
    return res.status(200).json(products);
});
exports.getOwnerProducts = catchAsync(async(req, res) => {
    const limit = req.query.limit || 10;
    const { offset } = req.query;
    const {sort,discount,isAction}=req.query
    let order, where = []
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
    where = getWhere(req.query)
    if (discount && discount != "false") {
        let discount = {
            [Op.ne]: 0
        }
        where.push({ discount })
    }
    if (isAction) {
        where.push({ isAction })
    }
    where.push({sellerId:null})
    const productss = await Products.findAll({
        order,
        limit,
        offset,
        include: [{
            model: Images,
            as: "images"
        }, ],
        where
    });
    const count=await Products.count({where})
    const products={
        count,
        rows:productss
    }
    return res.status(200).json(products);
});
exports.getTopProducts = catchAsync(async(req, res) => {
    const limit = req.query.limit || 10;
    const offset = req.query.offset || 0;
    const { sort, isAction, discount } = req.query
    let order, where = []
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
    where = getWhere(req.query)
    if (discount && discount != "false") {
        let discount = {[Op.ne]: 0}
        where.push({ discount })
    }
    if (isAction) where.push({ isAction })
    order.push(["sold_count", "DESC"])
    if (isAction) where.isAction = isAction;
    const productss = await Products.findAll({
        limit,
        offset,
        order,
        where,
        include: {
            model: Images,
            as: "images"
        },
    });
    const count=await Products.count({where:{sellerId:null}})
    const products={
        count,
        rows:productss
    }
    return res.status(200).send(products);
});
exports.getLikedProducts = catchAsync(async(req, res) => {
    const limit = req.query.limit || 10;
    const offset = req.query.offset || 0;
    const { sort, isAction, max_price, min_price, discount, sex,isNew } = req.query
    let order, where = []

    where=getWhere(req.query)
    // where.push({ isActive: true })
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
    if (discount && discount != "false") {
        let discount = {
            [Op.ne]: 0
        }
        where.push({ discount })
    }
    if (isAction) {
        where.push({ isAction })
    }
    order.push(["likeCount", "DESC"])

    const productss = await Products.findAll({
        order,
        limit,
        offset,
        where,
        include: {
            model: Images,
            as: "images"
        },
    });
    const count=await Products.count({where:{sellerId:null}})
    const products={
        count,
        rows:productss
    }
    return res.status(200).json(products);
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
    let keyword2=keyword
    keyword = keyword.toLowerCase();
    keywordsArray.push('%' + keyword + '%');
    keyword = '%' + capitalize(keyword) + '%';
    keywordsArray.push(keyword);
    let where = {
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
    }
    const productss = await Products.findAll({
        where,
        order,
        limit,
        offset,
        include:[
            {
                model:Images,
                as:"images"
            }
        ]
    });
    const count=await Products.count({where})
    delete where.isActive
    const subcategories = await Subcategories.findAndCountAll({
        where,
        order:[["createdAt","DESC"]],
        limit,
        offset
    })
    const seller = await Seller.findAll({
        where,
        order:[["createdAt","DESC"]],
        limit,
        offset
    })
    const products={
        data:productss,
        count:count
    }
    const searchhistory=await Searchhistory.findOne({where:{name:keyword2}})
    if(!searchhistory) await Searchhistory.create({name:keyword2,count:1})
    else await searchhistory.update({count:searchhistory.count+1})

    return res.status(200).send({ products, subcategories, seller });
});
exports.searchLite = catchAsync(async(req, res, next) => {
    let { keyword } = req.query
    let keyword2=keyword
    let keywordsArray = [];
    keyword = keyword.toLowerCase();
    keywordsArray.push('%' + keyword + '%');
    keyword = '%' + capitalize(keyword) + '%';
    keywordsArray.push(keyword);
    let where = {
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
    }
    const products = await Products.findAll({
        where,
        offset:0,
    });
    delete where.isActive
    const subcategories = await Subcategories.findAll({
        where,
        offset:0
    })
    const sellers = await Seller.findAll({
        where,
        offset:0
    })
    let names=[]
    for(const product of products){
        console.log(product.name_tm,product.name_ru,keyword2)
        if(product.name_tm.includes(keyword2) || product.name_tm.includes(capitalize(keyword2))){
            names.push(product.name_tm)
        }else {
            names.push(product.name_ru)
        }
}
    for(const subcategory of subcategories){
        if(subcategory.name_tm.includes(keyword2) || subcategory.name_tm.includes(capitalize(keyword2))){
            names.push(subcategory.name_tm)
        }else {
            names.push(subcategory.name_ru)
        }
    }
    for(const seller of sellers){
        if(seller.name_tm.includes(keyword2) || seller.name_tm.includes(capitalize(keyword2))){
            names.push(seller.name_tm)
        }else {
            names.push(seller.name_ru)
        }
    }
    console.log(names)
    return res.status(200).send(names);
})
exports.getOneProduct = catchAsync(async(req, res, next) => {
    const product_id = req.params.id

    let where={}
    if(isUUID(product_id)) {
        where.product_id=product_id
    }
    else where.product_code=product_id
    const oneProduct = await Products.findOne({
        where,
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
            },
            {
                model: Seller,
                as: "seller"
            }
        ]
    })
    if (!oneProduct) {
        return next(new AppError("Can't find product with that id"), 404);
    }
    const id = oneProduct.categoryId
    const recommenendations = await Categories.findOne({
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
    const product = {
        oneProduct,
        recommenendations
    }
    return res.send({ product })
})
exports.discount = catchAsync(async(req, res, next) => {
    const limit = req.query.limit || 20;
    const offset = req.query.offset || 0;
    const { sort, isAction } = req.query
    let order, where = []
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
    if (isAction) where.push({ isAction })
    where.push({ discount})
    order.push(["images", "id", "DESC"])
    const discount_products = await Products.findAll({
        where,
        order,
        limit,
        offset,
        include: [{
            model: Images,
            as: "images"
        }],
    });
    const count=await Products.count({where})
    const products={
        count,
        rows:discount_products
    }
    return res.status(200).send({ discount_products:products })
})
exports.actionProducts = catchAsync(async(req, res, next) => {
    const limit = req.query.limit || 20;
    const offset = req.query.offset || 0;
    const { discount } = req.query
    let order, where = []
    // where.push({ isActive: true })
    where=getWhere(req.query)
    // if (sort == 1) {
    //     order = [
    //         ['price', 'DESC']
    //     ];
    // } else if (sort == 0) {
    //     order = [
    //         ['price', 'ASC']
    //     ];
    // } else if (sort == 3) {
    //     order = [
    //         ["sold_count", "DESC"]
    //     ]
    // } else order = [
    //     ['updatedAt', 'DESC']
    // ];
    order=getOrder(req.query)
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
    const count=await Products.count({where})
    const products={
        count,
        rows:action_products
    }
    return res.status(200).send({ action_products:products })
})
exports.newProducts = catchAsync(async(req, res) => {
    const limit = req.query.limit || 10;
    const offset = req.query.offset || 0;
    const { sort, isAction, discount } = req.query
    let order, where = []
    // where.push({ isActive: true })

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

    if (discount && discount != "false") {
        let discount = {
            [Op.ne]: 0
        }
        where.push({ discount })
    }
    if (isAction) {
        where.push({ isAction })
    }
    where.push({ isNew: true })
    order.push(["images", "id", "DESC"])
    const new_products = await Products.findAll({
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
    return res.status(200).send({ new_products, count });
});
exports.setRating = catchAsync(async(req, res, next) => {
    const product = await Products.findOne({ where: { product_id: req.params.id } })
    if (!product) {
        return next(new AppError("Product not found"), 404)
    }
    let rating = ((product.rating * product.rating_count) + req.body.rating) / (product.rating_count + 1)
    await product.update({ rating, rating_count: product.rating_count + 1 })
    return res.status(200).send({ product })
})
exports.getMostSearches=catchAsync(async(req,res,next)=>{
    const searchhistory=await Searchhistory.findAll({
        limit:9,
        offset:0,
        order:[["count","DESC"]]
    })
    return res.send(searchhistory)
})
function getWhere({ max_price, min_price, sex,isNew }) {
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
    // where.push({isActive:true})
    return where
}
function getOrder({sort}){
    let order=[]
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
    return order
}
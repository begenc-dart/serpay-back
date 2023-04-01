const { Op } = require('sequelize');
const {
    Products,
    Images,
    Seller,
    Likedproducts
} = require('../../models');
const catchAsync = require('../../utils/catchAsync');
const AppError = require('../../utils/appError');


exports.getAll = catchAsync(async(req, res, next) => {
    const limit = req.query.limit || 20;
    let { keyword, offset, sort } = req.query;
    let keywordsArray = [];
    if (keyword) {
        keyword = keyword.toLowerCase();
        keywordsArray.push('%' + keyword + '%');
        keyword = '%' + capitalize(keyword) + '%';
        keywordsArray.push(keyword);
    }
    const sellers = await Seller.findAll({
        order: [
            ["sequence", "DESC"]
        ],
        limit,
        offset,
    });
    return res.status(200).send({ sellers })
})
exports.sellerProduct = catchAsync(async(req, res, next) => {
    let seller_id = req.params.id
    const limit=req.query.limit || 20
    const offset=req.query.offset || 0
    const seller = await Seller.findOne({ where: { seller_id } })
    if (!seller) {
        return next(new AppError(`Seller with id ${seller_id} not found`))
    }
    const {sort,discount,isAction}=req.query

    let order, where = []
    where=getWhere(req.query)
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
    where.push({ sellerId: seller.id })
    order.push(["images", "id", "DESC"])
    let productss = await Products.findAll({
        where,
        limit,
        offset,
        order,
        include: [{
            model: Images,
            as: "images"
        }]
    })
    const count = await Products.count({ where })
    productss = await isLiked(productss, req)
    const products={
        data:productss,
        count
    }
    return res.send({ seller, products })
})
const capitalize = function(string) {
    return string.charAt(0).toUpperCase() + string.slice(1);
};
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
};
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
        if(isNew) where.push({isNew})
    }
    where.push({isActive:true})
    return where
}
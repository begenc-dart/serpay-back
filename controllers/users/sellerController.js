const { Op } = require('sequelize');
const {
    Products,
    Images,
    Seller
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
            ["id", "DESC"]
        ],
        limit,
        offset,
    });
    return res.status(200).send({ sellers })
})
exports.sellerProduct = catchAsync(async(req, res, next) => {
    let seller_id = req.params.id
    const seller = await Seller.findOne({ where: { seller_id } })
    if (!seller) {
        return next(new AppError(`Seller with id ${seller_id} not found`))
    }
    const product = await Products.findAndCountAll({
        where: { sellerId: seller.id, isActive: true },
        include: [{
            model: Images,
            as: "images"
        }]
    })
    product = await isLiked(product, req)
    return res.send({ seller, product })
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
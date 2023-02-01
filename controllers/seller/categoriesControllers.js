const {
    Products,
    Subcategories,
    Images
} = require('../../models');
const AppError = require('../../utils/appError');
const catchAsync = require('../../utils/catchAsync');

exports.getSubcategoryProducts = catchAsync(async(req, res, next) => {
    const limit = req.query.limit || 20
    const offset = req.query.offset || 0
    const subcategory = await Subcategories.findOne({ where: { subcategory_id: req.params.id } })
    if (!subcategory) return next(new AppError("Subcategory not found", 404))
    const products = await Products.findAll({
        limit,
        offset,
        where: { subcategoryId: subcategory.id, sellerId: req.seller.id },
        order: [
            ["id", "DESC"]
        ],
        include:{
            model:Images,
            as:"images"
        }
    })
    return res.status(200).send(products)
})
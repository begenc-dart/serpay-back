const { Op } = require('sequelize');
const { Products, Subcategories, Images, Categories } = require('../../models');
const AppError = require('../../utils/appError');
const catchAsync = require('../../utils/catchAsync');

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
    const products = await Products.findAll({
        where, //isActive goy
        order,
        limit,
        offset,
        include: [{
            model: Images,
            as: "images"
        }]
    });
    const count = await Products.count({ where: { subcategoryId: subcategory.id } })
    return res.status(200).send({ products, count, subcategory });
});
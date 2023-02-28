const {
    Categories,
    Products,
    Subcategories,
    Images
} = require('../../models');
const {Op}=require("sequelize")
const AppError = require('../../utils/appError');
const catchAsync = require('../../utils/catchAsync');

exports.getAllCategories = catchAsync(async(req, res) => {
    const limit = req.query.limit || 20;
    const offset = req.query.offset;
    let {keyword}=req.query
    let where={}
    if(keyword && keyword!="undefined"){
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
        }
    }
    const categories = await Categories.findAll({
        limit,
        offset,
        where,
        order: [
            ['sequence', 'ASC'],
            ["createdAt", 'DESC'], 
            ["subcategories", "createdAt", "DESC"],
        ],
        include: {
            model: Subcategories,
            as: 'subcategories',
        },
    });
    return res.status(200).json(categories);
});

exports.getCategoryProducts = catchAsync(async(req, res, next) => {
    const category = await Categories.findOne({
        where: { category_id: req.params.id },
    });
    const limit=req.query.limit || 20
    const offset=req.query.offset || 0
    if (!category)
    return next(new AppError('Category did not found with that ID', 404));
    
    const { sort, isAction } = req.query
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
            [Op.ne]: 0,
        }
        where.push({ discount })
        if (isAction) where.push({ isAction })
        where.push({ categoryId:category.id })
    const products = await Products.findAll({
        where,
        order,
        limit,
        offset,
        include: [{
            model: Images,
            as: "images"
        }]
    });
    const count = await Products.count({ where})
    return res.status(200).send({ products, count });
});
const capitalize = function(string) {
    return string.charAt(0).toUpperCase() + string.slice(1);
};
function getWhere({ max_price, min_price, sex,is_new }) {
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
    if(is_new && is_new=="true") where.push({isNew:true})
    where.push({isActive:true})
    return where
}
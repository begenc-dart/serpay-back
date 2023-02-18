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
    const products = await Products.findAll({
        where: { categoryId: category.id }, //isActive goy sonundan
        order,
        limit,
        offset,
        include: [{
            model: Images,
            as: "images"
        }]
    });
    const count = await Products.count({ where: { categoryId: category.id } })
    return res.status(200).send({ products, count });
});
const capitalize = function(string) {
    return string.charAt(0).toUpperCase() + string.slice(1);
};
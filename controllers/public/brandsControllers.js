const AppError = require('../../utils/appError');
const catchAsync = require('../../utils/catchAsync');
const {
    Brands,
    Products,
    Categories,
    Stock,
    Images,
    Productsizes,
    Productcolor
} = require('../../models');

exports.getAllBrands = catchAsync(async(req, res) => {
    const limit = req.query.limit || 20;
    const offset = req.query.offset;

    const categories = await Categories.findAll({
        limit,
        offset,
        order: [
            ['id', 'ASC']
        ],
        include: {
            model: Brands,
            as: 'category_brands',
        },
    });

    return res.status(200).send({ categories });
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

    const products = await Products.findAll({
        where: { brandId: brand.id }, //isActive goy son
        order,
        limit,
        offset,
        include: [{
            model: Images,
            as: "images"
        }, ]
    });
    const count = await Products.count({ where: { brandId: brand.id } })
    return res.status(200).send({ products, count });
});
const jwt = require('jsonwebtoken');
const bcrypt = require('bcryptjs');
const AppError = require('../../utils/appError');
const catchAsync = require('../../utils/catchAsync');
const { Seller, Products, Productsizes, Productcolor, Images } = require('../../models');

exports.addSeller = catchAsync(async(req, res, next) => {
    let { password } = req.body
    req.body.password = await bcrypt.hash(password, 10)
    req.body.isActive = true
    let seller = await Seller.create(req.body)
    return res.send(seller)
})
exports.isActive = catchAsync(async(req, res, next) => {
    let { isActive, seller_id } = req.body
    let seller = await Seller.findOne({ where: { seller_id } })
    if (!seller) {
        return next(new AppError("There is no seller with this id", 404))
    }
    await seller.update({ isActive })
    return res.send(seller)
})
exports.allSellers = catchAsync(async(req, res, next) => {
    let limit = req.query.limit || 20
    const offset = req.query.offset || 0
    let seller = await Seller.findAll({
        limit,
        offset,
        order: [
            ["id", "DESC"]
        ]
    })
    let count = await Seller.count()
    return res.send({ seller, count })
})
exports.oneSeller = catchAsync(async(req, res, next) => {
    let seller_id = req.params.id
    console.log(seller_id, 473987492739)
    let seller = await Seller.findOne({
        where: { seller_id },
        include: [{
            model: Products,
            as: "products",
            include: {
                model: Images,
                as: "images"
            }
        }]
    })
    return res.send(seller)
})
exports.deleteSeller = catchAsync(async(req, res, next) => {
    const seller = await Seller.findOne({ where: { seller_id: req.params.id }, include: { model: Products, as: "seller_products" } })
    if (!seller) return next(new AppError("seller with that id not found", 404))
    for (const one_product of seller.seller_products) {
        const product = await Products.findOne({
            where: { product_id: one_product.product_id },
            include: [{
                    model: Productcolor,
                    as: "product_colors"
                },
                {
                    model: Productsizes,
                    as: "product_sizes"
                },
            ]
        });
        if (!product) return next(new AppError("Product with that id not found", 404))
        if (product.product_colors) {
            for (const color of product.product_colors) {
                let product_color = await Productcolor.findOne({ where: { id: color.id } })
                await product_color.destroy()
            }
        }
        if (product.product_sizes) {
            for (const size of product.product_sizes) {
                let product_size = await Productsizes.findOne({ where: { id: size.id } })
                await product_size.destroy()
            }
        }
        if (!product)
            return next(new AppError('Product did not found with that ID', 404));

        const images = await Images.findAll({ where: { productId: product.id } })
        for (const image of images) {
            fs.unlink(`static/${image.image}`, function(err) {
                if (err) throw err;
            })
            await image.destroy()
        }
        const stocks = await Stock.findAll({ where: { productId: [product.id] } });
        for (const stock of stocks) {
            await stock.destroy()
        }
        await product.destroy();
    }

})
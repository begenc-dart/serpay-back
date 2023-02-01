const AppError = require('../../utils/appError');
const catchAsync = require('../../utils/catchAsync');
const { Currency, Products, Productsizes } = require('../../models');
const { Op } = require('sequelize');

exports.getCurrency = catchAsync(async(req, res) => {
    const currency = await Currency.findOne();

    return res.status(200).send(currency);
});

exports.editCurrency = catchAsync(async(req, res, next) => {

    if (typeof req.body.value != 'number')
        return next(new AppError('Please provide currency (in number)', 400));

    const currency = await Currency.findOne();

    await currency.update(req.body);

    const newCurrency = currency.value;
    const products = await Products.findAll({
        where: {
            price_usd: {
                [Op.not]: null
            }
        },
    });

    if (products) {
        products.forEach(async(product) => {
            let price = product.price_usd * newCurrency;
            await product.update({ price });
        });
    }
    const product_sizes = await Productsizes.findAll({ where: { price_usd: {
                [Op.not]: null } } })
    if (product_sizes) {
        product_sizes.forEach(async(product_size) => {
            let price = product_size.price * newCurrency
            await product_size.update({ price })
        })
    }
    return res.status(200).send(currency);
});
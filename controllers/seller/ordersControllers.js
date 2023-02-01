const Op = require('sequelize').Op;
const AppError = require('../../utils/appError');
const catchAsync = require('../../utils/catchAsync');
const {
    Productsizes,
    Products,
    Orders,
    Orderproducts,
    Stock,
} = require('../../models');

exports.getAllOrders = catchAsync(async(req, res, next) => {
    const limit = req.query.limit || 20;
    let { user_phone, status } = req.query;
    let offset = req.query.offset || 0
    var where = {};
    if (user_phone) {
        user_phone = '+' + user_phone;
        where.user_phone = user_phone;
    }
    if (status) {
        where.status = status
    }
    where.sellerId = req.seller.id
    const orders = await Orders.findAll({
        where,
        order: [
            ['updatedAt', 'DESC']
        ],
        limit,
        offset,
    });
    const count = await Orders.count({ where })
    return res.status(201).send({ orders, count });
});
exports.getOrderProducts = catchAsync(async(req, res, next) => {
    const limit = req.query.limit || 20;
    const offset = req.query.offset;
    const order = await Orders.findOne({
        where: { order_id: req.params.id },
        include: {
            model: Orderproducts,
            as: 'order_products',
            order: [
                ['updatedAt', 'DESC']
            ],
            limit,
            offset,
        },
    });

    if (!order)
        return next(new AppError(`Order did not found with that ID`, 404));

    let orderProducts = [];
    // return res.send(order)
    for (var i = 0; i < order.order_products.length; i++) {
        for (var i = 0; i < order.order_products.length; i++) {
            const product = await Products.findOne({
                where: { product_id: order.order_products[i].product_id },
            });

            if (!product)
                return next(
                    new AppError(`Product did not found with your ID : ${i} `, 404)
                );

            const {
                product_id,
                name_tm,
                name_ru,
            } = product;
            if (order.order_products.product_size_id) {
                var product_size = await Productsizes.findOne({ where: { product_size_id: order.order_products.product_size_id } })
            }
            const obj = {
                order_product_id: order.order_products.order_product_id,
                product_id,
                name_tm,
                name_ru,
                image: order.order_products[i].image,
                quantity: order.order_products[i].quantity,
                price: order.order_products[i].price,
                total_price: order.order_products[i].total_price,
            };
            if (product_size) obj.size = product_size.size
            orderProducts.push(obj);
        }
    }

    res.status(200).send({ orderProducts });
});

exports.changeOrderStatus = catchAsync(async(req, res, next) => {
    const order = await Orders.findOne({
        where: {
            order_id: req.params.id,
        },
        include: {
            model: Orderproducts,
            as: 'order_products',
        },
    });

    if (!order) {
        return next(new AppError('Order did not found with that ID', 404));
    }

    if (req.body.status == "delivered") {
        for (var i = 0; i < order.order_products.length; i++) {
            const product = await Products.findOne({
                where: { product_id: order.order_products[i].product_id },
            });
            const product_size = await Productsizes
            const stock = await Stock.findOne({ where: { productId: product.id } });
            await stock.update({
                stock_quantity: stock.stock_quantity - order.order_products[i].quantity,
            });
            await product.update({ sold_count: product.sold_count + order.order_products[i].quantity })
        }
    }

    await Orderproducts.update({ status: req.body.status }, { where: { orderId: order.id } })
    await order.update({
        status: req.body.status,
    });
    return res.status(201).send(order);
});

exports.deleteOrderProduct = catchAsync(async(req, res, next) => {
    const orderproduct = await Orderproducts.findOne({
        where: { orderproduct_id: req.params.id },
    });
    if (!orderproduct) {
        return next(new AppError('Order Product did not found with that ID', 404));
    }
    const order = await Orders.findOne({ where: { id: orderproduct.orderId } });

    await order.update({
        total_price: order.total_price - orderproduct.total_price,
    });

    await orderproduct.destroy();

    return res.status(200).json({ msg: 'Successfully Deleted' });
});
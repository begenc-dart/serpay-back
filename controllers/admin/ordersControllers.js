const Op = require('sequelize').Op;
const AppError = require('../../utils/appError');
const catchAsync = require('../../utils/catchAsync');
const {
    Productsizes,
    Products,
    Orders,
    Orderproducts,
    Stock,
    Seller
} = require('../../models');

exports.getAllOrders = catchAsync(async(req, res, next) => {
    const limit = req.query.limit || 20;
    let { user_phone, status,keyword } = req.query;
    console.log(req.query)
    let offset = req.query.offset || 0
    var where = {};
    if (keyword != "undefined") {
        let keywordsArray = [];
        keyword = keyword.toLowerCase();
        keywordsArray.push('%' + keyword + '%');
        keyword = '%' + capitalize(keyword) + '%';
        keywordsArray.push(keyword);
        where = {
            [Op.or]: [{
                    user_phone: {
                        [Op.like]: {
                            [Op.any]: keywordsArray,
                        },
                    },
                },
                {
                    user_name: {
                        [Op.like]: {
                            [Op.any]: keywordsArray,
                        },
                    },
                },
            ],
        };
    }
    if (user_phone) {
        user_phone = '+' + user_phone;
        where.user_phone = user_phone;
    }
    if (status!="" && status !=null) {
        where.status = status
    }   
    const orders = await Orders.findAll({
        where,
        order: [
            ['id', 'DESC']
        ],
        limit,
        offset,
        include:{
            model:Seller,
            as:"seller"
        }
    });
    const count = await Orders.count({ where })
    return res.status(201).send({ orders, count });
});
exports.getOrderProducts = catchAsync(async(req, res, next) => {
    const limit = req.query.limit || 20;
    const offset = req.query.offset;
    const order = await Orders.findOne({
        where: { order_id: req.params.id },
        include:[ {
            model: Orderproducts,
            as: 'order_products',
            order: [
                ['updatedAt', 'DESC']
            ],
            limit,
            offset,
        },
        {
            model:Seller,
            as:"seller"
        }],
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
                continue;

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

    res.status(200).send({ order,orderProducts });
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

    if (req.body.status == "Gowshuruldy") {
        for (var i = 0; i < order.order_products.length; i++) {
            const product = await Products.findOne({
                where: { product_id: order.order_products[i].product_id },
            });
            let where={
                productId:product.id
            }
            if(order.order_products[i].product_size_id!=null) 
            var product_size = await Productsizes.findOne({where:{product_size_id:order.order_products[i].product_size_id}})
            if(product_size) where={productId:product.id,productsizeId:product_size.id}
            const stock = await Stock.findOne({where});
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
exports.deleteOrder=catchAsync(async(req, res, next) => {
    const order=await Orders.findOne({ where: { order_id: req.params.id}})
    await Orderproducts.destroy({where:{orderId:order.id}})
    await order.destroy()
    return res.send("sucess")
});
const capitalize = function(string) {
    return string.charAt(0).toUpperCase() + string.slice(1);
};
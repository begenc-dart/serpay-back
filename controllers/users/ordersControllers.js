const AppError = require('../../utils/appError');
const catchAsync = require('../../utils/catchAsync');
const { Products, Orders, Orderproducts, Productsizes, Productcolor, Stock, Seller,Images } = require('../../models');
const { Op } = require("sequelize")
exports.addMyOrders = catchAsync(async(req, res, next) => {
    var {
        address,
        payment_type,
        i_take,
        note,
        user_phone,
        seller_id
    } = req.body;
    let checkedProducts = [];
    let total_price = 0;
    let total_quantity = 0;
    let where= { userId: req.user.id , is_ordered: false ,isSelected:true}
    if(seller_id!=null && seller_id!="null") where.seller_id=seller_id
    const order_products = await Orderproducts.findAll({where})
    let orders_array = []
    if (order_products.length == 0) return next(new AppError("Select products to order", 400))
    for (var j = 0; j < order_products.length; j++) {
        if (order_products[j].product_size_id != null) {
            var product_size = await Productsizes.findOne({ where: { product_size_id: order_products[j].product_size_id }, include: { model: Stock, as: "product_size_stock" } })
        }
        var product = await Products.findOne({
            where: { product_id: order_products[j].product_id },
            include: {
                model: Stock,
                as: "product_stock"
            }
        });
        if (product_size) {
            if (product_size.product_size_stock.quantity < order_products[j].quantity && product.sellerId==null) {
                order_products[j].quantity = product_size.product_size_stock.quantity
            }
            order_products[j].price=product_size.price;
            order_products[j].total_price = product_size.price * order_products[j].quantity
        } else if (product && product.sellerId==null) {
            if (product.product_stock[0].quantity < order_products[j].quantity) {
                order_products[j].quantity = product.product_stock[0].quantity
            }
            order_products[j].total_price = product.price * order_products[j].quantity
            order_products[j].price=product.price
        }
        total_quantity = total_quantity + order_products[j].quantity;
        total_price = total_price + order_products[j].total_price;
    }
        let sellerId = 0
        if (order_products[0].seller_id) {
            var seller = await Seller.findOne({where:{ seller_id: order_products[0].seller_id }})
            sellerId = seller.id
        }
        console.log(123,req.body.delivery_time)
        let delivery_time = req.body.delivery_time.split(" ")
        let time = delivery_time[1]
        const today = new Date()
        if (i_take) time = ""
        if (delivery_time[0] == "1") {
            const tomorrow = new Date(today)
            tomorrow.setDate(tomorrow.getDate() + 1)
            delivery_time = lessThan(tomorrow.getDate()) + "." + lessThan(tomorrow.getMonth() + 1) + "/" + time
        } else {
            delivery_time = lessThan(today.getDate()) + "." + lessThan(today.getMonth() + 1) + "/" + time
        }
        const order = await Orders.create({
            userId: req.user.id,
            total_price,
            address,
            user_name: req.body.name,
            user_phone,
            payment_type,
            i_take,
            note,
            sellerId,
            status: "Garashylyar",
            delivery_time,
            total_quantity,
        });
        orders_array.push(order)
        for (var x = 0; x < order_products.length; x++) {
            await Orderproducts.update({
                orderId: order.id,
                quantity: order_products[x].quantity,
                price: order_products[x].price,
                total_price: order_products[x].total_price,
                is_ordered: true,
                is_selected: false,
                status: "Garashylyar"
            }, {
                where: {
                    orderproduct_id: order_products[x].orderproduct_id,
                    userId: req.user.id
                }
            });

        }
    const io=req.app.get("socketio")
    io.emit("new order",{message:"new order"})
    return res.status(200).json({
        status: 'Your orders accepted and will be delivered as soon as possible',
        data: {
            orders_array,
        },
    });
})
exports.getMyOrders = catchAsync(async(req, res, next) => {
    const limit = req.query.limit || 20;
    const offset = req.query.offset || 0;
    const { status } = req.query
    let where = {}
    let order_status = {
        status: {
            [Op.ne]: "not"
        }
    }
    if (status) order_status = {
        [Op.and]: [{
                status: {
                    [Op.not]: "not"
                }
            },
            { status: status }
        ]
    }

    where = order_status
    where.userId = req.user.id
    const order_products = await Orderproducts.findAll({
        where,
        order: [
            ['createdAt', 'DESC']
        ],
        limit,
        offset,
    });
    const checked_products = []
    for (var i = 0; i < order_products.length; i++) {
        const product = await Products.findOne({
            where: { product_id: order_products[i].product_id },
        });

        if (!product)
            continue
        const {
            product_id,
            name_tm,
            name_ru,
            body_tm,
            body_ru
        } = product;
        if (order_products[i].product_size_id != null) {
            var product_size = await Productsizes.findOne({ where: { product_size_id: order_products[i].product_size_id } })
        }
        const obj = {
            orderproduct_id: order_products[i].orderproduct_id,
            product_id,
            name_tm,
            name_ru,
            body_tm,
            body_ru,
            image: order_products[i].image,
            quantity: order_products[i].quantity,
            createdAt: order_products[i].createdAt,
            status: order_products[i].status
        };
        if (product_size) {
            obj.size = product_size.size
            obj.price = product_size.price
            obj.price_old = product_size.price_old
            obj.total_price = product_size.price * order_products[i].quantity
            obj.product_size_id = product_size.product_size_id
            if(product_size.product_color){
                obj.product_color_name_tm=product_size.product_color.name_tm
                obj.product_color_name_ru=product_size.product_color.name_ru
            }
        } else if (product) {
            obj.price = product.price
            obj.price_old = product.price_old
            obj.total_price = product.price * order_products[i].quantity
        }
        checked_products.push(obj);
    }
    let new_array = []
    for (let i = 0; i < checked_products.length; i++) {
        if (i == 0) {
            const objj = {
                date: checked_products[i].createdAt,
                orders: [checked_products[i]]
            }
            new_array.push(objj);
        } else {
            let bool = true;
            for (let j = 0; j < new_array.length; j++) {
                if (new_array[j].date.getDate() == checked_products[i].createdAt.getDate()) {
                    new_array[j].orders.push(checked_products[i]);
                    bool = false;
                    break
                }
            }
            if (bool) {
                new_array.push({
                    date: checked_products[i].createdAt,
                    orders: [checked_products[i]]
                })
            }
        }
    }
    const count = await Orderproducts.count({
        where
    });
    return res.send({ orders: new_array, count })

    // res.status(200).send(orders);
});
exports.getMyOrderProducts = catchAsync(async(req, res, next) => {
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
exports.getNotOrderedProducts = catchAsync(async(req, res, next) => {
    const limit = req.query.limit || 20
    const offset = req.query.offset || 0
    let where={}
    where.userId=req.user.id
    where.is_ordered=false
    if(req.query.isSelected) where.isSelected=req.query.isSelected 
    if(req.query.seller_id) where.seller_id=req.query.seller_id
    const order_products = await Orderproducts.findAll({ where, limit, offset,order:[["createdAt","DESC"]] })
    const checked_products = []

    for (var i = 0; i < order_products.length; i++) {
        var product_size
        const product = await Products.findOne({
            where: { product_id: order_products[i].product_id },
            include:[{
                model:Productsizes,
                as:"product_sizes",
                include:{
                    model:Stock,
                    as:"product_size_stock",
                }
            },
            {
                model:Seller,
                as:"seller"
            },
            {
                model:Productcolor,
                as:"product_colors",
                include:[{
                    model:Productsizes,
                    as:"product_sizes",
                    include:{   
                        model:Stock,
                        as:"product_size_stock"
                    },
                },
                {
                    model:Images,
                    as:"product_images"
                },
            ]
            },
            {
                model:Stock,
                as:"product_stock",
                limit:1
            }
        ],
        });
        if (!product) continue
        const {
            product_id,
            name_tm,
            name_ru,
            body_tm,
            body_ru
        } = product;
        if (order_products[i].product_size_id != null) {
            product_size = await Productsizes.findOne({ where: { product_size_id: order_products[i].product_size_id } })
        }
        // if (order_products[i].product_color_id != null) {
        //     var product_color = await Productcolor.findAll({ where: { product_color_id: order_products.product_color_id },
        //         include:[
        //         {
        //             model:Productsizes,
        //             as:"product_sizes"
        //         },
        //         {
        //             model:Images,
        //             as:"images"
        //         }] 
        //         })
        // }
        const obj = {
            orderproduct_id: order_products[i].orderproduct_id,
            product_id,
            name_tm,
            name_ru,
            body_tm,
            body_ru,
            image: order_products[i].image,
            quantity: order_products[i].quantity,
            isSelected: order_products[i].isSelected,
            seller_id: order_products[i].seller_id,
        };
        if(product.product_colors.length!=0){
            obj.product_color=product.product_colors
        }
        if (product_size) {
            obj.size = product_size.size
            obj.price = product_size.price
            obj.price_old = product_size.price_old
            obj.total_price = (product_size.price * order_products[i].quantity)
            obj.product_size_id = product_size.product_size_id
            obj.productsizes=product.product_sizes
            // obj.productsize_stock=product_size.stock
        } else if (product) {
            obj.price = product.price
            obj.price_old = product.price_old
            obj.total_price = (product.price * order_products[i].quantity)  
            obj.stock=product.product_stock[0].quantity
        }
        checked_products.push(obj);
        product_size=null
    }
    let new_array = []
    for (let i = 0; i < checked_products.length; i++) {
        if (i == 0) {
            const seller=await Seller.findOne({where:{seller_id: checked_products[i].seller_id}})
            const objj = {
                seller_id: checked_products[i].seller_id,
                orders: [checked_products[i]],
                seller
            }
            new_array.push(objj);
        } else {
            let bool = true;
            for (let j = 0; j < new_array.length; j++) {
                if (new_array[j].seller_id == checked_products[i].seller_id) {
                    new_array[j].orders.push(checked_products[i]);
                    bool = false;
                    break
                }
            }
            if (bool) {
            const seller=await Seller.findOne({where:{seller_id: checked_products[i].seller_id}})
                new_array.push({
                    seller_id: checked_products[i].seller_id,
                    orders: [checked_products[i]],
                    seller
                })
            }
        }
    }
    return res.status(200).send({ not_ordered_products: new_array })
})
exports.deleteOrderedProduct = catchAsync(async(req, res, next) => {
    const { orderproduct_ids } = req.body
    for (const orderproduct_id of orderproduct_ids) {
        const orderproduct = await Orderproducts.findOne({ where: { orderproduct_id } })
        if (orderproduct.orderId) {
            await orderproduct.update({ userId: null })
        } else {
            await orderproduct.destroy()
        }
    }
    return res.status(200).send({ msg: "Success" })
})
exports.deleteAllOrderedProducts = catchAsync(async(req, res, next) => {
    const { status } = req.query
    let where = {}
    let order_status = {
        status: {
            [Op.ne]: "not"
        }
    }
    if (status) order_status = {
        [Op.and]: [{
                status: {
                    [Op.not]: "not"
                }
            },
            { status: status }
        ]
    }

    where = order_status
    where.userId = req.user.id
    console.log(where)
    const order_products = await Orderproducts.findAll({ where })
    for (const one_product of order_products) {
        for (const orderproduct_id of order_products) {
            const orderproduct = await Orderproducts.findOne({ where: { orderproduct_id: one_product.orderproduct_id } })
            await orderproduct.update({ userId: null })

        }
    }
    return res.status(200).send({ msg: "Success" })
})
function takeDate() {
    const date = new Date()
    let time = date.getMonth() + "." + date.getDay() + "." + date.getHours() + "." + date.getMinutes()

    return time
}

function lessThan(number) {
    if (number < 10) return "0" + number
    return number
}
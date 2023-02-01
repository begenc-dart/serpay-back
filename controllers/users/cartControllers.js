const AppError = require('../../utils/appError');
const catchAsync = require('../../utils/catchAsync');
const { Products, Stock, Orderproducts, Productcolor, Productsizes, Images, Seller } = require('../../models');
const { Op } = require("sequelize")
exports.getMyCart = catchAsync(async(req, res, next) => {
    const limit = req.query.limit || 20
    const offset = req.query.offset
    const my_cart = await Orderproducts.findAll({ where: { userId: req.user.id, is_ordered: false } }, limit, offset)
    let checked_products = []
    for (let i = 0; my_cart.length; i++) {
        const product = await Products.findOne({ where: { product_id: my_cart[i].product_id } })
        let obj = {
            product_id: product.product_id,
            body_tm: product.body_tm,
            body_ru: product.body_ru,
            name_tm: product.name_tm,
            name_ru: product.name_ru,
            image: my_cart[i].image,
            quantity: my_cart[i].quantity,
            price_old: product.price_old,
            price: product.price,
            isSelected: my_cart[i].isSelected
        }
        checked_products.push(obj)
    }
    return res.status(200).send({ checked_products });
});
exports.addMyCart = catchAsync(async(req, res, next) => {
    const { product_id, product_size_id, quantity } = req.body;
    var orderProductData = {}
    let product = await Products.findOne({
        where: { product_id },
        include: [
            { model: Images, as: "images" },
            { model: Stock, as: "product_stock" },
            { model: Seller, as: "seller" }
        ]
    })
    if (!product) return next(new AppError("Product not found with that id", 404))
    if (product_size_id) {
        let productsize = await Productsizes.findOne({
            where: { product_size_id },
            include: [{
                    model: Stock,
                    as: "product_size_stock"
                },
                {
                    model: Productcolor,
                    as: "product_color",
                    include: {
                        model: Images,
                        as: "product_images"
                    }
                }
            ]
        })
        if (!productsize) return next(new AppError("Size with that id not found"))
        orderProductData.price = productsize.price
        if (productsize.product_color != null) {
            orderProductData.image = productsize.product_color.product_images[0].image
            orderProductData.product_color_id = productsize.product_color.product_color_id

        } else orderProductData.image = product.images[0].image
        orderProductData.product_size_id = productsize.product_size_id
        orderProductData.quantity = quantity
        orderProductData.total_price = quantity * productsize.price
        orderProductData.product_id = product.product_id
    } else if (product_id) {
        orderProductData.price = product.price
        orderProductData.total_price = product.price * quantity
        orderProductData.quantity = quantity
        orderProductData.image = product.images[0].image
    }
    if (product.seller) orderProductData.seller_id = product.seller.seller_id

    orderProductData.userId = req.user.id
    orderProductData.is_ordered = false
    orderProductData.product_id = product_id
        // orderProductData.createdAt = new Date(2018, 11, 24, 10, 33, 30, 0)
    const order_product = await Orderproducts.create(orderProductData)
    return res.status(201).send(order_product)
})
exports.updateProduct = catchAsync(async(req, res, next) => {
    const { quantity,productsize_id } = req.body
    const order_product = await Orderproducts.findOne({ where: { orderproduct_id: req.params.id } })
    if (!order_product) return next(new AppError("Order product with that id not found", 404))
    const product = await Products.findOne({ where: { product_id: order_product.product_id } })
    if (!product) return next(new AppError("Product not found with that id not found", 404))
    let price = product.price
    if (order_product.product_size_id != null) {
        if(productsize_id!=undefined) var product_size_id=productsize_id
        else var product_size_id=order_product.product_size_id
        var product_size = await Productsizes.findOne({ where: { product_size_id } })
        price = product_size.price
        const product_color=await Images.findAll({where:{productcolorId:product_size.productColorId},limit:1,order:[["createdAt","ASC"]]})
        if(product_color) var image=product_color[0].image
        else var image=order_product.image
    }
    await order_product.update({
        price,
        total_price: price * quantity,
        quantity: Number(quantity),
        image
    })
    return res.status(200).send({ order_product })
})
exports.select = catchAsync(async(req, res, next) => {
    const order_products = await Orderproducts.findOne({ where: { orderproduct_id: req.params.id } })
    if (!order_products) return next(new AppError("Order product with that id not found"))
    await order_products.update({ isSelected: req.body.isSelected })
    return res.status(200).send({ order_products })
})
exports.isOrdered = catchAsync(async(req, res, next) => {
    const { product_id, product_size_id } = req.query
    const product = await Products.findOne({ where: { product_id } })
    if (!product) return next(new AppError("Product not fount with that id", 404))
    if (product_size_id && product_size_id != undefined) var product_size = await Productsizes.findOne({ where: { product_size_id } })
    let where = {
        userId: req.user.id,
        product_id: product.product_id,
        is_ordered:false
    }
    if (product_size) where.product_size_id = product_size_id
    const order_product = await Orderproducts.findOne({ where })
    let status = 0
    if (order_product) {
        status = 1
        order_product.price = product.price
        order_product.total_price = order_product.price * order_product.quantity
    }
    if (product_size && order_product) {
        status = 1
        order_product.price = product_size.price
        order_product.total_price = order_product.price * order_product.quantity
    }
    return res.status(200).send({ status, order_product })
})
exports.deleteProduct = catchAsync(async(req, res, next) => {
    const order_product = await Orderproducts.findOne({
        where: {
            [Op.and]: [{ product_id: req.params.id, userId: req.user.id }]
        }
    })
    if (!order_product) return next(new AppError("Order product with that id not found", 404))
    await order_product.destroy()
    return res.status(200).send({ msg: "Success" })
})
exports.deleteSelected = catchAsync(async(req, res, next) => {
    const { orderproduct_ids } = req.body
    for (const orderproduct_id of orderproduct_ids) {
        await Orderproducts.destroy({ where: orderproduct_id })
    }
    return res.status(200).send({ msg: "Success1" })
})
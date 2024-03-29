const bcrypt = require('bcryptjs');
const AppError = require('../../utils/appError');
const catchAsync = require('../../utils/catchAsync');
const { Seller, Products, Productsizes, Productcolor, Images,Stock,Orderproducts } = require('../../models');
const {Op}=require("sequelize")
const fs=require("fs")
exports.addSeller = catchAsync(async(req, res, next) => {
    let { password } = req.body
    req.body.password = await bcrypt.hash(password, 10)
    req.body.isActive = true
    let seller = await Seller.create(req.body)
    return res.send(seller)
})
exports.isActive = catchAsync(async(req, res, next) => {
    let { isActive, seller_id,sequence } = req.body
    let seller = await Seller.findOne({ where: { seller_id } })
    console.log(req.body)
    if (!seller) {
        return next(new AppError("There is no seller with this id", 404))
    }
    await seller.update({ isActive,sequence })
    return res.send(seller)
})
exports.allSellers = catchAsync(async(req, res, next) => {
    let limit = req.query.limit || 20
    const offset = req.query.offset || 0
    let {keyword,isActive}=req.query
    var where = {};
    if (keyword && keyword != "undefined") {
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
        };
    }
    if(isActive!="undefined") where.isActive=isActive
    let seller = await Seller.findAll({
        limit,
        offset,
        where,
        order: [
            ["updatedAt", "DESC"]
        ]
    })
    let count = await Seller.count({where})
    return res.send({ seller, count })
})
exports.oneSeller = catchAsync(async(req, res, next) => {
    let seller_id = req.params.id
    const limit=req.query.limit ||20
    const offset=req.query.offset ||0
    console.log("one seller")
    let seller = await Seller.findOne({
        where: { seller_id },
        include: [{
            model: Products,
            as: "products",
            order: [
                ['id', 'DESC'],
                // ["images", "id", "DESC"]
            ],
            limit,
            offset,
            include: [{
                model: Images,
                as: "images",
                limit: 1
            },
            {
                model: Productcolor,
                as: "product_colors",
                limit: 1
            },
            {
                model: Productsizes,
                as: "product_sizes",
                limit:1
            }
        ],
    }],
})
    console.log(seller.products.length)
    if(!seller) return next(new AppError("Seller not found",404))
    const count=await Products.count({where: {sellerId:seller.id}})
    return res.send({seller,count})
})
exports.deleteSeller = catchAsync(async(req, res, next) => {
    const seller = await Seller.findOne({ where: { seller_id: req.params.id }, include: { model: Products, as: "products" } })
    if (!seller) return next(new AppError("seller with that id not found", 404))
    for (const one_product of seller.products) {
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
        if (product.product_colors)  await Productcolor.destroy({ where: { productId: product.id } })
        if (product.product_sizes) await Productsizes.destroy({ where: { productId: product.id } })
        if (!product)
            return next(new AppError('Product did not found with that ID', 404));

        const images = await Images.findAll({ where: { productId: product.id } })
        for (const image of images) {
            fs.unlink(`static/${image.image}`, function(err) {
                if (err) console.log(err);
            })
        }
        await Images.destroy({where: { productId: product.id}})
        await Stock.destroy({ where: { productId: [product.id] } });
        await product.destroy();
    }
    await seller.destroy()
    return res.send("Sucess")
})
exports.getAccount=catchAsync(async(req,res,next)=>{
    const { startTime, endTime, seller_id } = req.query
    // { startTime: '2022-08-09', endTime: '2022-08-27', phoneNumber: '' }
    let where={}
if (startTime) {
    let firstDate = new Date(startTime)
    let secondDate = new Date(endTime)
    where.createdAt = {
        [Op.gte]: firstDate,
        [Op.lte]: secondDate
    }
    where.seller_id=seller_id
    where.status="Gowshuryldy"
}
    let sum=0
    const order_products=await Orderproducts.findAll({
        where
    })
    for(const order_product of order_products){
        sum+=order_product.total_price
    }
    return res.send({sum})
})
exports.editSellerProduct=catchAsync(async(req,res,next)=>{
    const product = await Products.findOne({
        where: { product_id: req.params.id },
    });
    if (!product)
        return next(new AppError('Product did not found with that ID', 404))
    await product.update(req.body);
    return res.status(200).send(product);
})
const capitalize = function(string) {
    return string.charAt(0).toUpperCase() + string.slice(1);
};
const { Op } = require('sequelize');
const {
    Products,
    Images,
    Seller,
    Orders,
    Carddata
} = require('../../models');
const axios=require("axios")
const catchAsync = require('../../utils/catchAsync');
const AppError = require('../../utils/appError')

exports.halkFinished = catchAsync(async(req, res, next) => {
    // https://mpi.gov.tm/payment/rest/getOrderStatus.do?password=Fdsr23gg343R3dT&orderId=5727329e-b9fe-4531-92f1-b8f963f15588&userName=611122505793
    const rest=await axios.get("https://mpi.gov.tm/payment/rest/getOrderStatus.do?password=Fdsr23gg343R3dT&userName=611122505793%orderId="+req.query.orderId)
    console.log(rest.data)
    const carddata=await Carddata.findOne({where:{mdOrderId:req.query.orderId}})
    const socket=req.app.get("socketio")
    if(rest.data.ErrorCode==0){
        socket.broadcast.to(carddata.socketId).emit("finished")
    }else{
        socket.broadcast.to(carddata.socketId).emit("error")
    }
    return res.status(200).send(rest.data.ErrorMessage)
})
exports.sellerProduct = catchAsync(async(req, res, next) => {
    let seller_id = req.params.id
    const limit=req.query.limit || 20
    const offset=req.query.offset || 0
    const seller = await Seller.findOne({ where: { seller_id } })
    if (!seller) {
        return next(new AppError(`Seller with id ${seller_id} not found`))
    }
    const {sort,discount,isAction}=req.query
    let order, where = []
    where=getWhere(req.query)
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
    if (discount && discount != "false") {
        let discount = {
            [Op.ne]: 0
        }
        where.push({ discount })
    }
    if (isAction) {
        where.push({ isAction })
    }
    where.push({ sellerId: seller.id })
    order.push(["images", "id", "DESC"])
    const productss = await Products.findAll({
        where,
        limit,
        offset,
        order,
        include: [{
            model: Images,
            as: "images"
        }]
    })
    const count = await Products.count({ where })
    const products={
        data:productss,
        count
    }
    // product = awaxit isLiked(product)
    return res.send({ seller, products })
})
exports.sellerProductNew = catchAsync(async(req, res, next) => {
    let seller_id = req.params.id
    const seller = await Seller.findOne({ where: { seller_id } })
    if (!seller) {
        return next(new AppError(`Seller with id ${seller_id} not found`))
    }
    const product = await Products.findAndCountAll({
        where: { sellerId: seller.id, isActive: true,isNew:true },
        include: [{
            model: Images,
            as: "images"
        }]
    })
    // product = await isLiked(product)
    return res.send({ seller, product })
})
exports.setId=catchAsync(async(req, res, next) => {
    await Orders.update({sellerId:0},{where:{userId:{[Op.not]:null}}})
})
const capitalize = function(string) {
    return string.charAt(0).toUpperCase() + string.slice(1);
}
function getWhere({ max_price, min_price, sex,isNew }) {
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
        if(isNew) where.push({isNew})
    }
    where.push({isActive:true})
    return where
}
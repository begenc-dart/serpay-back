const Op = require('sequelize').Op;
const AppError = require('../../utils/appError');
const catchAsync = require('../../utils/catchAsync');
const {
    Freeproducts,
    Sharingusers,
    Images,
    Users,
} = require('../../models');
exports.getAllFreeProducts = catchAsync(async(req, res, next) => {
    const free_products = await Freeproducts.findAll({
        order: [
            [
                "createdAt", "DESC"
            ]
        ],
        limit:1,
        include: {
            model: Images,
            as: "images"
        }
    })    
    return res.status(200).send(free_products)
})
exports.getOne = catchAsync(async(req, res, next) => {
    const free_product = await Freeproducts.findOne({ where: { freeproduct_id: req.params.id } })
    if (!free_product) return next(new AppError("Free product not found with that id", 404))
    const max = await Sharingusers.max("count", { where: { freeproductId: free_product.id } })
    free_product.max = max
    const top5 = await Sharingusers.findAll({
        where: { freeproductId: free_product.id },
        order: [
            ["count", "DESC"]
        ],
        limit: 5
    })
    let ready_top5 = []
    for (const top of top5) {
        const user = await Users.findOne({
            where: { id: top.userId },
            attributes: ["image", "nickname"]
        })
        
        let obj = {
            count: top.count,
            nickname: user.nickname,
            image: user.image
        }
        ready_top5.push(obj)
    }
    return res.status(200).send({ free_product, top5: ready_top5 })
})
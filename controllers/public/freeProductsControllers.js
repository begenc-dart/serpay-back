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
        where:{isActive:true},
        order: [
            [
                "createdAt", "DESC"
            ]
        ],
        // limit:1,
        include: {
            model: Images,
            as: "images"
        }
    })    
    let index=0
    for(const free_product of free_products) {
        const max = await Sharingusers.max("count", { where: { freeproductId: free_product.id } })
        const count=await Sharingusers.count({where:{freeproductId:free_product.id}})

        if(max) free_products[index].max=max
        if(count) free_products[index].contestants=count
        index+=1
    }
    const obj={
        expire_time:free_products[0].expire_date,
        data:free_products
    }
    console.log()
    return res.status(200).send(obj)
})
exports.getOne = catchAsync(async(req, res, next) => {
    const free_product = await Freeproducts.findOne({ where: { freeproduct_id: req.params.id },
        include:{
            model:Images,
            as:"images"
        } })
    if (!free_product) return next(new AppError("Free product not found with that id", 404))
    const max = await Sharingusers.max("count", { where: { freeproductId: free_product.id },        
     })
    const count=await Sharingusers.count({where:{freeproductId:free_product.id}})
    if(max) free_product.max=max
    if(count) free_product.contestants=count
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
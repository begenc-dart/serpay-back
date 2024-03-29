const { Freeproducts, Images,Sharingusers,Users } = require("../../models")
const { Op } = require('sequelize');
const AppError = require('../../utils/appError');
const catchAsync = require('../../utils/catchAsync');
const sharp = require('sharp')
const fs = require("fs")
const { v4 } = require("uuid")
exports.allFreeProducts = catchAsync(async(req, res, next) => {
    const freeProduct = await Freeproducts.findAndCountAll({
        order: [
            ["id", "DESC"]
        ],
        include:{
            model:Images,
            as:"images"
        }
    })
    return res.status(200).send(freeProduct)
})
exports.addFreeProduct = catchAsync(async(req, res, next) => {
    let date = req.body.date.split("-")
    const hour = req.body.time.split(":")
    const d = new Date(date[0], date[1] - 1, date[2], hour[0], hour[1]);
    req.body.expire_date = d

    const freeproduct = await Freeproducts.create(req.body)
    return res.status(201).send(freeproduct)
})
exports.getFreeProduct = catchAsync(async(req, res, next)=>{
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
            attributes: ["image", "nickname","user_phone","username"]
        })
        let obj = {
            count: top.count,
            nickname: user.nickname,
            username:user.username,
            phone_number:user.user_phone,
        }
        ready_top5.push(obj)
    }
    return res.status(200).send({ free_product, top5: ready_top5 })
})
exports.editFreeProduct = catchAsync(async(req, res, next) => {
    const freeproduct_id = req.params.id
    let date = req.body.date.split("-")
    const hour = req.body.time.split(":")
    const d = new Date(date[0], date[1] - 1, date[2], hour[0], hour[1]);
    req.body.expire_date = d
    const freeproduct = await Freeproducts.findOne({ where: { freeproduct_id } })
    if (!freeproduct) return next(new AppError("Free product not found with that id", 404))
    await freeproduct.update(req.body)
    return res.status(200).send(freeproduct)
})
exports.uploadImage = catchAsync(async(req, res, next) => {
    const freeproduct_id = req.params.id
    const freeproduct = await Freeproducts.findOne({ where: { freeproduct_id } })
    let imagesArray = []
    req.files = Object.values(req.files)
    req.files = intoArray(req.files)
    if (!freeproduct)
        return next(new AppError('Product did not found with that ID', 404));
    for (const images of req.files) {
        const image_id = v4()
        const image = `${image_id}_product.webp`;
        const photo = images.data
        let buffer = await sharp(photo).resize(1080,720).webp().toBuffer()

        await sharp(buffer).toFile(`static/${image}`);
        let newImage = await Images.create({ image, image_id, freeproductId: freeproduct.id })
        imagesArray.push(newImage)
    }
    return res.status(200).send(imagesArray)
})
exports.deleteFreeProduct = catchAsync(async(req, res, next) => {
    const freeproduct_id = req.params.id
    const freeproduct = await Freeproducts.findOne({ where: { freeproduct_id } })
    if (freeproduct.image) {
        fs.unlink(`static/${freeproduct.image}`, (err) => {
            if (err) throw new Error("image not found")
        })
    }
    const sharing_users=await Sharingusers.findAll({where:{freeproductId:freeproduct.id}})
    let array=[]
    for (const sharing_user of sharing_users){
        array.push(sharing_user.userId)
    }
    await Users.update({isParticipating:false},{where:{id:{[Op.not]:null}}})
    await freeproduct.destroy()

    return res.status(200).send({ msg: "Sucessfully deleted" })
})

const intoArray = (file) => {
    if (file[0].length == undefined) return file
    else return file[0]
}
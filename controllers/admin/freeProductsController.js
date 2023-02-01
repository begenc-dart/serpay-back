const { Freeproducts, Images } = require("../../models")
const { Op } = require('sequelize');
const AppError = require('../../utils/appError');
const catchAsync = require('../../utils/catchAsync');
const sharp = require('sharp')
const fs = require("fs")
const { v4 } = require("uuid")
exports.allFreeProducts = catchAsync(async(req, res, next) => {
    const freeProduct = await Freeproducts.findAll({
        order: [
            ["id", "DESC"]
        ]
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
        let buffer = await sharp(photo).webp().toBuffer()
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
    await freeproduct.destroy()
    return res.status(200).send({ msg: "Sucessfully deleted" })
})
const intoArray = (file) => {
    if (file[0].length == undefined) return file
    else return file[0]
}
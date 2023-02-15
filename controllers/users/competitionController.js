const AppError = require('../../utils/appError');
const catchAsync = require('../../utils/catchAsync');
const {  Sharingusers, Freeproducts,  Enteredusers,User } = require('../../models');
const { Op } = require("sequelize")

exports.enterToCompetition = catchAsync(async(req, res, next) => {
    if (req.user.isParticipating) return next(new AppError("You are already competing", 403))
    const { freeproduct_id } = req.body
    const freeproduct = await Freeproducts.findOne({ where: { freeproduct_id } })
    if (!freeproduct) return next(new AppError("Product with that not found", 404))
    req.body.freeproductId = freeproduct.id
    req.body.userId = req.user.id
    const sharing_user = await Sharingusers.create(req.body)
    return res.status(201).send(sharing_user)
})
exports.generateLink = catchAsync(async(req, res, next) => {
    const freeproduct = await Freeproducts.findOne({ where: { freeproduct_id: req.body.freeproduct_id } })
    if (!freeproduct) return next(new AppError("Free product with that id not found", 404))
    const link = "http://10.192.168.23:3000/hyzmatlar/share/" + freeproduct.freeproduct_id
    return res.status(200).send(link)
})
exports.addOne = catchAsync(async(req, res, next) => {
    if(req.user.isParticipating) return next(new AppError("You already competing or gave your voice",402))
    const user=await User.findOne({where:{[Op.or]:[{username:req.body.username},{phone_number:req.body.username}]}})
    if(!user) return next(new AppError("User with your parameters does not exist",404))
    const freeproduct = await Freeproducts.findOne({ where: { freeproduct_id: req.body.freeproduct_id } })
    if (!freeproduct) return next(new AppError("Free product with that id not found"), 404)
    const sharing_user = await Sharingusers.findOne({ where: { userId:user.id,freeproductId:freeproduct.id } })
    if (!sharing_user) return next(new AppError("Sharing user with that id not found"), 404)
    await sharing_user.update({
        count: sharing_user.count + 1
    })
    return res.status(200).send({ sharing_user })
})
exports.deleteCompetitor = catchAsync(async(req, res, next) => {
    const sharing_user = await Sharingusers.findOne({ where: { userId: req.user.id, freeproductId: req.params.id } })
    sharing_user.destroy()
    return res.status(200).send({ msg: "Successfully deleted" })
})
exports.getMyResult = catchAsync(async(req, res, next) => {
    const freeproduct = await Freeproducts.findOne({ where: { freeproduct_id: req.params.id } })
    const sharing_users = await Sharingusers.findAll({ where: { freeproductId: freeproduct.id } })
    for (let i = 0; i < sharing_users.length; i++) {
        var index = i + 1
        if (sharing_users[i].userId == req.user.id) break
    }
    return res.status(200).send({ position: index })
})
const AppError = require('../../utils/appError');
const catchAsync = require('../../utils/catchAsync');
const {  Sharingusers, Freeproducts,  Enteredusers,Users } = require('../../models');
const { Op } = require("sequelize")

exports.enterToCompetition = catchAsync(async(req, res, next) => {
    const { freeproduct_id } = req.body
    console.log(req.body)
    const freeproduct = await Freeproducts.findOne({ where: { freeproduct_id } })
    if (!freeproduct) return next(new AppError("Product with that not found", 404))
    req.body.freeproductId = freeproduct.id
    if(freeproduct){
        const expire_time=freeproduct.expire_date
        const now=new Date()
        const split=expire_time.split(" ")
        const expire_date=new Date(split[0]+"T"+split[1])
        if(expire_date.getDate()==now.getDate() && expire_date.getHours()==now.getHours()){
            return next(new AppError("Time is expired", 403))
        }
    }
    req.body.userId = req.user.id
    if (req.user.isParticipating){
        var sharing_user=await Sharingusers.findOne({where:{userId:req.user.id,freeproductId:freeproduct.id}})
        const link = "http://panda.com.tm/hyzmatlar/share/" + freeproduct.freeproduct_id+"?sharinguser_id="+sharing_user.sharinguser_id
        if(sharing_user) return res.status(201).send({sharing_user,link})
    }
    if (req.user.isParticipating){
        console.log("ife firdim")
        var sharing_user=await Sharingusers.findOne({where:{userId:req.user.id,freeproductId:freeproduct.id}})
        if(sharing_user){
            const link = "http://panda.com.tm/hyzmatlar/share/" + freeproduct.freeproduct_id+"?sharinguser_id="+sharing_user.sharinguser_id
            return res.status(201).send({sharing_user,link})
        }
    }
    var sharing_user = await Sharingusers.create(req.body)
    await Users.update({isParticipating:true},{where:{id:req.user.id}})
    const link = "http://panda.com.tm/hyzmatlar/share/" + freeproduct.freeproduct_id+"?sharinguser_id="+sharing_user.sharinguser_id
    return res.status(201).send({sharing_user,link})
})
exports.generateLink = catchAsync(async(req, res, next) => {
    const freeproduct = await Freeproducts.findOne({ where: { freeproduct_id: req.query.freeproduct_id } })
    const sharing_user=await Sharingusers.findOne({where:{userId:req.user.id}})
    if (!freeproduct) return next(new AppError("Free product with that id not found", 404))
    const link = "http://panda.com.tm/hyzmatlar/share/" + freeproduct.freeproduct_id+"?sharinguser_id="+sharing_user.sharinguser_id
    return res.status(200).send(link)
})
exports.addOne = catchAsync(async(req, res, next) => {
    if(req.user.isParticipating) return next(new AppError("You already competing or gave your voice",402))
    const user=await Users.findOne({where:{[Op.or]:[{username:req.body.username},{user_phone:req.body.username}]}})
    if(!user) return next(new AppError("User with your parameters does not exist",404))
    const freeproduct = await Freeproducts.findOne({ where: { freeproduct_id: req.body.freeproduct_id } })
    if (!freeproduct) return next(new AppError("Free product with that id not found"), 404)
    if(freeproduct){
        const expire_time=freeproduct.expire_date
        const now=new Date()
        const split=expire_time.split(" ")
        const expire_date=new Date(split[0]+"T"+split[1])
        if(expire_date.getDate()==now.getDate() && expire_date.getHours()==now.getHours()){
            return next(new AppError("Time is expired", 403))
        }
    }
    const sharing_user = await Sharingusers.findOne({ where: { userId:user.id,freeproductId:freeproduct.id } })
    if (!sharing_user) return next(new AppError("Sharing user with that id not found"), 404)
    await sharing_user.update({
        count: sharing_user.count + 1
    })
    await Users.update({isParticipating:true},{where:{id:req.user.id}})
    const link = "http://panda.com.tm/hyzmatlar/share/" + freeproduct.freeproduct_id+"?sharinguser_id="+sharing_user.sharinguser_id
    return res.status(200).send({ sharing_user,link })
})
exports.addOneFromLink = catchAsync(async(req, res, next) => {
    if(req.user.isParticipating) return next(new AppError("You already competing or gave your voice",402))
    const sharing_user = await Sharingusers.findOne({ where: { sharinguser_id:req.body.sharinguser_id } })
    if (!sharing_user) return next(new AppError("Sharing user with that id not found"), 404)
    const freeproduct = await Freeproducts.findOne({ where: { id: sharing_user.freeproductId } })
    if (!freeproduct) return next(new AppError("Free product with that id not found"), 404)
    if(freeproduct){
        const expire_time=freeproduct.expire_date
        const now=new Date()
        const split=expire_time.split(" ")
        const expire_date=new Date(split[0]+"T"+split[1])
        if(expire_date.getDate()==now.getDate() && expire_date.getHours()==now.getHours()){
            return next(new AppError("Time is expired", 403))
        }
    }
    await sharing_user.update({
        count: sharing_user.count + 1
    })
    await Users.update({isParticipating:true},{where:{id:req.user.id}})
    return res.status(200).send({ sharing_user })
})
exports.deleteCompetitor = catchAsync(async(req, res, next) => {
    const sharing_user = await Sharingusers.findOne({ where: { userId: req.user.id, freeproductId: req.params.id } })
    sharing_user.destroy()
    return res.status(200).send({ msg: "Successfully deleted" })
})
exports.getMyResult = catchAsync(async(req, res, next) => {
    const freeproduct = await Freeproducts.findOne({ where: { freeproduct_id: req.params.id,isActive:true } })
    const sharing_users = await Sharingusers.findAll({ where: { freeproductId: freeproduct.id },order:[["count","DESC"]] })
    const sharing_user=await Sharingusers.findOne({ where: { freeproductId:freeproduct.id,userId:req.user.id}})
    if(sharing_user){
        for (let i = 0; i < sharing_users.length; i++) {
            var index = i+1
            if (sharing_users[i].userId == req.user.id && sharing_users[i].freeproductId==freeproduct.id)
            break
        }
        req.user.password=undefined
    const link = "http://panda.com.tm/hyzmatlar/share/" + freeproduct.freeproduct_id+"?sharinguser_id="+sharing_user.sharinguser_id
    return res.status(200).send({ position: index,sharing_user:req.user,count:sharing_users[index-1].count,link })
    }
    else return res.status(200).send({position:null})
})
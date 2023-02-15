const { Mailers } = require("../../models")
const catchAsync = require('../../utils/catchAsync');
exports.getAllMail=catchAsync(async(req,res,next)=>{
    const limit=req.query.limit || 20;
    const offset=req.query.offset || 0
    const mails=await Mailers.findAndCountAll({
        limit,
        offset,
        order:[[
            "id","DESC"
        ]]
    })
    return res.send(mails)
})
exports.getMail=catchAsync(async(req,res,next)=>{
    const mail=await Mailers.findOne({where:{id:req.params.id}})
    return res.send(mail)
})
exports.deleteMail=catchAsync(async(req,res,next)=>{
    const mail=await Mailers.findOne({where:{id:req.params.id}})
    await mail.destroy()
    return res.send("Successfully deleted")
})
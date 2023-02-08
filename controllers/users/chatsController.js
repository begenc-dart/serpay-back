const AppError = require('../../utils/appError');
const catchAsync = require('../../utils/catchAsync');
const { Op } = require("sequelize")
const { Chats, Users, Userfriends } = require("../../models")
exports.addNewFriend = catchAsync(async(req, res, next) => {
    const user = await Users.findOne({ where: { nickname: req.body.nickname } })
    const is_friends = await Userfriends.findOne({
        where: {
            [Op.or]: [{
                    [Op.and]: [{
                            user_id1: req.user.user_id,
                        },
                        {
                            user_id2: user.user_id
                        }
                    ]
                },
                {
                    [Op.and]: [{
                            user_id1: user.user_id,
                        },
                        {
                            user_id2: req.user.user_id
                        }
                    ]
                }
            ]
        }
    })
    if (is_friends) return res.status(200).send("You are already friends")
    const friends = await Userfriends.create()
})
exports.getAllChats = catchAsync(async(req, res, next) => {
    const my_chats = await Userfriends.findAll({
        where: {
            [Op.or]: [{
                    user_id1: req.user.user_id
                },
                {
                    user_id2: req.user.user_id
                }
            ]
        },
        order:[["id","DESC"]]
    })
    for (let i = 0; i < my_chats.length; i++) {
        const user1 = await Users.findOne({ where: { user_id: my_chats[i].user_id1 } })
        if (!user1) continue
        const user2 = await Users.findOne({ where: { user_id: my_chats[i].user_id2 } })
        if (!user2) continue
        my_chats[i].nickname1 = user1.nickname
        my_chats[i].nickname2 = user2.nickname
    }
    return res.status(200).send(my_chats)
})
exports.getOneChat = catchAsync(async(req, res, next) => {
    const limit = req.query.limit || 20
    const offset = req.query.offset || 0
    const user = await Users.findOne({ where: { nickname: req.params.nickname } })
    const chats = await Chats.findAll({
        where: {
            [Op.or]: [{
                    [Op.and]: [{
                            user_id1: user.user_id
                        },
                        {
                            user_id2: req.user.user_id
                        }
                    ]
                },
                {
                    [Op.and]: [{
                            user_id1: req.user.user_id
                        },
                        {
                            user_id2: user.user_id
                        }
                    ]
                }
            ]
        },
        limit,
        offset,
        order: [
            ["createdAt", "DESC"]
        ]
    })
    for (let i = 0; i < chats.length; i++) {
        if (chats[i].user_id1 == req.user.user_id) chats[i].isYou = true
    }
    return res.status(200).send(chats.reverse())
})
exports.deleteFriendChat = catchAsync(async(req,res,next)=>{
    const userfriend=await Userfriends.findOne({
        where:{
            user_id1:req.body.user_id1,user_id2:req.body.user_id2
        }
    })
    if(!userfriend) return next(new AppError("There is no chat with that id"),404)
    await Chats.destroy({
        where: {
            [Op.or]: [{
                    [Op.and]: [{
                            user_id1: req.body.user_id1,
                        },
                        {
                            user_id2: req.body.user_id2
                        }
                    ]
                },
                {
                    [Op.and]: [{
                            user_id1: req.body.user_id2,
                        },
                        {
                            user_id2: req.body.user_id1
                        }
                    ]
                }
            ]
        }
    })
    await userfriend.destroy()
    return res.send("Sucess")
})